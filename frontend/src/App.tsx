import React, { useEffect, useState, useCallback } from "react";
import { getPeople, enrichPerson, getCompanySnippets } from "./api";
import PeopleList from "./components/PeopleList";
import ProgressLog from "./components/ProgressLog";
import ResultCard from "./components/ResultCard";
import "./App.css";

// Define explicit types for our data structures
type Person = {
  id: string;
  fullName: string;
  email: string;
  title: string;
  company: { id: string; name: string; domain: string };
};

type ProgressEvent = {
  step: string;
  message: string;
  iteration?: number;
  query?: string;
  [key: string]: any;
};

type Result = {
  id: string;
  payload: any;
  sourceUrls: { urls: string[] };
  createdAt: string;
};

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    getPeople().then((res) => setPeople(res.data));
  }, []);

  const fetchResult = useCallback(async (companyId: string) => {
    try {
      // CORRECTED: Use the consistent 'api' helper instead of raw fetch
      const res = await getCompanySnippets(companyId);
      if (res.data && res.data.length > 0) {
        setResult(res.data[0]); // Display the most recent snippet
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setIsEnriching(false);
    }
  }, []);

  const handleEnrich = async (person: Person) => {
    setProgress([]);
    setResult(null);
    setIsEnriching(true);
    setSelectedPerson(person);

    try {
      const { data } = await enrichPerson(person.id);
      const jobId = data.jobId;

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const eventSource = new EventSource(`${API_URL}/progress/${jobId}`);

      eventSource.onmessage = (event) => {
        const progressData: ProgressEvent = JSON.parse(event.data);
        setProgress((prev) => [...prev, progressData]);

        if (progressData.step === "complete") {
          eventSource.close();
          fetchResult(person.company.id);
        } else if (progressData.step === "error") {
          console.error("Agent error:", progressData.message);
          eventSource.close();
          setIsEnriching(false);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource.close();
        setIsEnriching(false);
      };
    } catch (error) {
      console.error("Enrichment error:", error);
      setIsEnriching(false);
    }
  };

  return (
    <div className="container">
      <h1>Alpha Platform - Research Agent</h1>

      <section className="people-section">
        <h2>People Directory</h2>
        <PeopleList
          people={people}
          onEnrich={handleEnrich}
          isEnriching={isEnriching}
        />
      </section>

      {(isEnriching || progress.length > 0) && (
        <section className="progress-section">
          <h2>Research Progress</h2>
          {selectedPerson && (
            <p>
              Researching <strong>{selectedPerson.fullName}</strong> at{" "}
              <strong>{selectedPerson.company.name}</strong>...
            </p>
          )}
          <ProgressLog logs={progress} />
          {isEnriching && progress.at(-1)?.step !== "complete" && (
            <div className="loading-spinner">Processing...</div>
          )}
        </section>
      )}

      {result && (
        <section className="results-section">
          <h2>Research Results</h2>
          <ResultCard result={result} />
        </section>
      )}
    </div>
  );
}

export default App;
