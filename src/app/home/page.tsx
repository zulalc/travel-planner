"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState } from "react";
import Itinerary, { ItineraryProps } from "@/app/(components)/Itinerary";
import {
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaPlane,
} from "react-icons/fa";

const HomePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryProps["data"] | null>(
    null
  );
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (endDate && endDate < startDate) {
      setEndDate("");
    }
  }, [startDate, endDate]);

  const handleInterestChange = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const requestData = `Destination: ${destination}, Start Date: ${startDate}, End Date: ${endDate}, Budget: ${budget}, Interests: ${interests?.join(
      ", "
    )}. Please provide the itinerary in plain JSON format without any backticks or additional formatting.`;

    let attempts = 0;
    const MAX_RETRIES = 3;
    let itineraryData: ItineraryProps["data"] | null = null;

    while (attempts < MAX_RETRIES) {
      try {
        const result = await model.generateContent(
          `Following trip: ${requestData}. Please provide a detailed itinerary in a valid JSON format with the following structure: {
          
            "destination": "Your destination",
            "title": "Your Trip Title",
            "dateRange": "YYYY-MM-DD to YYYY-MM-DD",
            "budget": "Budget Amount",
            "interests": "Interests (this field can be empty if no specific interests are provided)",
            "days": [
              {
                "date": "YYYY-MM-DD",
                "activities": [
                  {
                    "time": "HH:MM AM/PM",
                    "description": "Activity description."
                  }
                ]
              }
            ],
            "budgetBreakdown": [
              {
                "item": "Description",
                "amount": "Amount"
              }
            ],
            "notes": [
              "Any important notes"
            ]
          }
        `
        );
        const itineraryJson = result.response.text();
        console.log("Raw itinerary response:", itineraryJson);

        itineraryData = JSON.parse(itineraryJson) as ItineraryProps["data"];

        break;
      } catch (error) {
        console.log("Error fetching itinerary:", error);
        attempts += 1;
        if (attempts >= MAX_RETRIES) {
          console.error("Max retries reached, giving up.");
        }
      }
    }

    setLoading(false);
    setItinerary(itineraryData);
  };

  const handleReset = () => {
    setDestination("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setInterests([]);
    setItinerary(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-400 to-cyan-400 text-white sm:p-8">
      <header className="text-center mb-12 sm:mb-12">
        <div className="flex justify-center items-center">
          <FaPlane className="w-20 h-20 text-cyan-600 text-2xl ml-5 md:w-10 md:h-10 md:mr-2" />
          <h1 className="text-5xl font-bold tracking-tight my-4 md:mx-4 md:mt-10">
            Plan Your Next Trip
          </h1>
        </div>
        <p className="text-lg">
          Plan your dream vacation effortlessly with AI-powered travel planner
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-100 text-gray-900 p-8 rounded-lg shadow-lg max-w-lg w-full space-y-4 md:space-y-6"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-4 text-black">
          Get Started
        </h2>
        <div className="mb-4 w-full">
          <label htmlFor="destination" className="font-medium">
            Destination
          </label>
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm p-3"
              placeholder="e.g., Paris, Tokyo, New York"
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:space-y-0">
          <div className="flex-1">
            <label htmlFor="startDate" className="font-medium">
              Start Date
            </label>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-blue-300 bg-white rounded-md shadow-sm p-3"
                required
                min={today}
              />
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="endDate" className="font-medium">
              End Date
            </label>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-blue-300 bg-white rounded-md shadow-sm p-3"
                required
                min={startDate || today}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="budget" className="font-medium">
            Budget($)
          </label>
          <div className="flex items-center">
            <FaDollarSign className="mr-2" />
            <input
              type="number"
              id="budget"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm p-3"
              placeholder="Enter your budget"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="font-medium mb-1">Interests</label>
          <div className="flex flex-wrap space-x-3">
            {["Adventure", "Relaxation", "Culture", "Food"].map((interest) => (
              <div key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  id={interest}
                  value={interest}
                  checked={interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="mr-2"
                />
                <label htmlFor={interest} className="text-m">
                  {interest}
                </label>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-800 text-white p-3 rounded-md font-semibold text-lg hover:bg-cyan-600 transition duration-300"
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>

        {itinerary && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full bg-red-600 text-white p-3 rounded-md font-semibold text-lg hover:bg-red-500 transition duration-300 mt-4"
          >
            Reset
          </button>
        )}
      </form>

      {itinerary && <Itinerary data={itinerary} />}
    </div>
  );
};

export default HomePage;
