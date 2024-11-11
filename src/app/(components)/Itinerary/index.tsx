"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { BiDownload } from "react-icons/bi";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaCloud,
  FaCloudRain,
  FaHiking,
  FaListUl,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaMoneyBillWave,
  FaPlaneDeparture,
  FaSnowflake,
  FaSun,
  FaUtensils,
} from "react-icons/fa";
import { LuCircleDollarSign } from "react-icons/lu";
import { MdOutlineNotes } from "react-icons/md";
import { TbCoffee } from "react-icons/tb";
import { fetchWeather } from "@/app/services/weatherService";
import { RiDrizzleFill, RiMistFill } from "react-icons/ri";
import { IoThunderstorm } from "react-icons/io5";
import { GiFog } from "react-icons/gi";
import {
  WiDayHaze,
  WiDust,
  WiSandstorm,
  WiSmoke,
  WiStrongWind,
} from "react-icons/wi";
import { FaTornado, FaVolcano } from "react-icons/fa6";

export interface ItineraryProps {
  data: {
    destination: string;
    title: string;
    dateRange: string;
    budget: string;
    interests: string;
    days: {
      date: string;
      activities: { time: string; description: string }[];
    }[];
    budgetBreakdown: { item: string; amount: string }[];
    extraActivities: { name: string; price: string }[];
    notes: string[];
  };
}

type Interest = "Adventure" | "Relaxation" | "Culture" | "Food";
const interestIcons: Record<Interest, JSX.Element> = {
  Adventure: <FaHiking className="m-2" />,
  Relaxation: <TbCoffee className="m-2" />,
  Culture: <FaBookOpen className="m-2" />,
  Food: <FaUtensils className="m-2" />,
};

type Weather =
  | "Clear"
  | "Clouds"
  | "Rain"
  | "Drizzle"
  | "Thunderstorm"
  | "Snow"
  | "Mist"
  | "Smoke"
  | "Haze"
  | "Dust"
  | "Fog"
  | "Sand"
  | "Ash"
  | "Squall"
  | "Tornado";

const weatherIcons: Record<Weather, JSX.Element> = {
  Clear: <FaSun className="m-2" />,
  Clouds: <FaCloud className="m-2" />,
  Rain: <FaCloudRain className="m-2" />,
  Drizzle: <RiDrizzleFill className="m-2" />,
  Thunderstorm: <IoThunderstorm className="m-2" />,
  Snow: <FaSnowflake className="m-2" />,
  Mist: <RiMistFill className="m-2" />,
  Smoke: <WiSmoke className="m-2" />,
  Haze: <WiDayHaze className="m-2" />,
  Dust: <WiDust className="m-2" />,
  Fog: <GiFog className="m-2" />,
  Sand: <WiSandstorm className="m-2" />,
  Ash: <FaVolcano className="m-2" />,
  Squall: <WiStrongWind className="m-2" />,
  Tornado: <FaTornado className="m-2" />,
};

const Itinerary = ({ data }: ItineraryProps) => {
  const itineraryRef = useRef<HTMLDivElement | null>(null);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  useEffect(() => {
    const fetchWeatherForecast = async () => {
      setLoadingWeather(true);
      try {
        const weatherForecast = await fetchWeather(
          data.destination,
          data.dateRange
        );
        console.log(weatherForecast, "weather");
        setWeatherData(weatherForecast);
      } catch (error) {
        console.log(error);
      }
      setLoadingWeather(false);
    };
    fetchWeatherForecast();
  }, [data.dateRange]);

  const downloadPDF = async () => {
    const element = itineraryRef.current;

    if (element && element instanceof HTMLElement) {
      //element.style.visibility = "hidden"; // hide temporarily to avoid flickering on mobile

      const originalWidth = element.style.width; // saves current width for restoring later
      element.style.width = "1024px";

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const contentHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, contentHeight); // add first page

        //for multiple page
        let remainingHeight = contentHeight - pdfHeight;
        let yOffset = -remainingHeight;

        while (remainingHeight > 0) {
          pdf.addPage(); // Add a new page
          pdf.addImage(imgData, "PNG", 0, yOffset, pdfWidth, contentHeight);
          remainingHeight -= pdfHeight;
          yOffset -= pdfHeight;
        }

        pdf.save(`${data.title}_Itinerary.pdf`);
      } catch (error) {
        console.log("Failed to generate PDF", error);
      }
      element.style.width = originalWidth; // restore the width so it still looks right on the mobile phone
      //element.style.visibility = "visible"; // show element after PDF generated
    } else {
      console.log("Element not found or is not an HTMLElement");
    }
  };

  return (
    <div>
      <div className="flex justify-center mt-4">
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
        >
          <BiDownload className="text-lg" />
          Download Itinerary as PDF
        </button>
      </div>

      <div
        ref={itineraryRef}
        className="mt-3 p-6 bg-indigo-200 rounded-lg shadow-md text-gray-800 space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center">
            <FaPlaneDeparture className="mr-2" /> {data.title}
          </h2>
          <p className="flex items-center justify-center text-gray-600">
            <FaCalendarAlt className="mr-2" /> {data.dateRange}
          </p>
          <p className="flex items-center justify-center text-gray-600">
            <FaMoneyBillWave className="mr-2" /> Budget: ${data.budget}
          </p>

          <p className="flex items-center justify-center text-gray-600">
            Interests:
            {data.interests ? (
              <span className="flex items-center">
                {data.interests.split(", ").map((interest, index) => {
                  const icon =
                    interestIcons[interest as keyof typeof interestIcons] ||
                    null;
                  return (
                    <span key={index} className="flex items-center mr-2">
                      {icon} {interest}
                    </span>
                  );
                })}
              </span>
            ) : (
              <span className="text-gray-400 ml-2">
                No specific interest provided
              </span>
            )}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center">
            <FaListUl className="mr-2 text-2xl" />
            Daily Itinerary
          </h3>
          {data.days.map((day, dayIndex) => (
            <div key={dayIndex} className="border-t border-gray-300 pt-4">
              <h4 className="text-lg font-semibold text-indigo-600">
                {new Date(day.date).toLocaleDateString("en-GB")}

                {weatherData[dayIndex] && weatherData[dayIndex].weather[0] && (
                  <span className="flex items-center ml-4 text-gray-600">
                    {/* Get the icon for the weather condition */}
                    {weatherIcons[
                      weatherData[dayIndex].weather[0]
                        .main as keyof typeof weatherIcons
                    ] || null}
                    <span className="ml-2">
                      {weatherData[dayIndex].weather[0].main}
                    </span>
                  </span>
                )}
              </h4>

              <ul className="mt-2 space-y-2">
                {day.activities.map((activity, activityIndex) => (
                  <li
                    key={activityIndex}
                    className="flex items-start space-x-2"
                  >
                    <span className="w-6 h-6 flex-shrink-0">
                      <FaMapMarkerAlt className="text-indigo-500 w-4 h-4" />
                    </span>

                    <span>
                      <strong>{activity.time}:</strong> {activity.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold flex items-center">
            <FaMoneyBill className="mr-2" /> Budget Breakdown
          </h3>
          <ul className="space-y-1">
            {data.budgetBreakdown.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <div className="flex items-start space-x-2">
                  <LuCircleDollarSign className="text-green-700" />
                  <span>{item.item}</span>
                </div>
                <span>${item.amount}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold flex items-center">
            <MdOutlineNotes className="mr-2" /> Notes
          </h3>
          <ul className="list-disc list-inside text-gray-600">
            {data.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
