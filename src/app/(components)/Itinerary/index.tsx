import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaHiking,
  FaListUl,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaMoneyBillWave,
  FaPlaneDeparture,
  FaUtensils,
} from "react-icons/fa";
import { LuCircleDollarSign } from "react-icons/lu";
import { MdOutlineNotes } from "react-icons/md";
import { TbCoffee } from "react-icons/tb";

export interface ItineraryProps {
  data: {
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

const Itinerary = ({ data }: ItineraryProps) => {
  const itineraryRef = useRef(null);

  const downloadPDF = async () => {
    const element = itineraryRef.current;

    if (!element) {
      console.log("Element not found");
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.title}_Itinerary.pdf`);
    } catch (error) {
      console.log("Failed to generate PDF", error);
    }
  };

  return (
    <div>
      <button
        onClick={downloadPDF}
        className="bg-blue-500 text-white p-2 rounded-md mb-4"
      >
        Download Itinerary as PDF
      </button>

      <div
        ref={itineraryRef}
        className="mt-8 p-6 bg-indigo-200 rounded-lg shadow-md text-gray-800 space-y-6"
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
            <FaListUl className="mr-2" /> Daily Itinerary
          </h3>
          {data.days.map((day, dayIndex) => (
            <div key={dayIndex} className="border-t border-gray-300 pt-4">
              <h4 className="text-lg font-semibold text-indigo-600">
                {day.date}
              </h4>
              <ul className="mt-2 space-y-2">
                {day.activities.map((activity, activityIndex) => (
                  <li
                    key={activityIndex}
                    className="flex items-start space-x-2"
                  >
                    <FaMapMarkerAlt className="text-indigo-500" />
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
