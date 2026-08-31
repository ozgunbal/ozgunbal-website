import { useState } from "react";
import type { Route } from "./+types/trainings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trainings - Özgün Bal" },
    { name: "description", content: "Training programs and workshops" },
  ];
}

type TabType = "internal" | "external";

// Icon Components
const ClockIcon = () => (
  <svg className="inline w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="inline w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="inline w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="inline w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function Trainings() {
  const [activeTab, setActiveTab] = useState<TabType>("internal");

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-foreground)' }}>Trainings</h1>

      {/* Sliding Border Rectangle Tab Navigation */}
      <div className="mb-8">
        <nav className="relative inline-flex gap-2 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div
            className="absolute top-1 bottom-1 rounded-md border-2 border-blue-500 transition-all duration-300 ease-in-out"
            style={{
              left: activeTab === "internal" ? "4px" : "calc(50% + 4px)",
              width: "calc(50% - 8px)",
            }}
          />
          <button
            onClick={() => setActiveTab("internal")}
            className="relative z-10 px-6 py-2 rounded-md font-medium transition-colors"
            style={{
              color: activeTab === "internal" ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              width: 'calc(50% - 4px)'
            }}
          >
            Internal Training
          </button>
          <button
            onClick={() => setActiveTab("external")}
            className="relative z-10 px-6 py-2 rounded-md font-medium transition-colors"
            style={{
              color: activeTab === "external" ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              width: 'calc(50% - 4px)'
            }}
          >
            External Training
          </button>
        </nav>
      </div>

      {/* Legend */}
      <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
        <div className="flex flex-wrap gap-8 text-base" style={{ color: 'var(--color-muted-foreground)' }}>
          <div className="flex items-center gap-2">
            <MonitorIcon /> Online
          </div>
          <div className="flex items-center gap-2">
            <UserIcon /> In-person
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "internal" ? (
          <div>
            {/* Internal Legend */}
            <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
              <div className="flex flex-wrap gap-8 text-base" style={{ color: 'var(--color-muted-foreground)' }}>
                <div className="flex items-center gap-2">
                  <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" /> Innovance Consultancy
                </div>
                <div className="flex items-center gap-2">
                  <img src="/images/vestek-icon.png" alt="Vestek" className="inline w-8 h-5" /> Vestek
                </div>
              </div>
            </div>
            <ul className="space-y-6 list-none">
              <li className="text-lg mb-4" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">GitHub Copilot CLI Deep Dive - Plan, Implement, Parallelize, Measure</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 14.05.2026
                  </span>
                  <span className="flex items-center gap-1">
                    <MonitorIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-4" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Technical Writing</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 11.01.2024
                  </span>
                  <span className="flex items-center gap-1">
                    <MonitorIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">CI / CD for Frontend Web Projects</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 23.11.2023
                  </span>
                  <span className="flex items-center gap-1">
                    <MonitorIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Asynchronous Javascript at Innovance React Bootcamp (w/ Kodluyoruz)</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 29.07.2021
                  </span>
                  <span className="flex items-center gap-1">
                    <MonitorIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Asynchronous Javascript</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 08.10.2020
                  </span>
                  <span className="flex items-center gap-1">
                    <MonitorIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Functional Programming in Javascript</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 01.10.2020
                  </span>
                  <span className="flex items-center gap-1">
                    <MonitorIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Object Oriented Javascript</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 28.09.2020
                  </span>
                  <span className="flex items-center gap-1">
                    <MonitorIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">React Hook Migration</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 40 mins
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 19.12.2019
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">React.js</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 4 hours
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 02.02.2019
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Javascript</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 4 hours
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 05.01.2019
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/innovance-icon.png" alt="Innovance" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Javascript</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 6 x 30 minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> April & May 2018
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/vestek-icon.png" alt="Vestek" className="inline w-8 h-5" />
                  </span>
                </div>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            {/* External Legend */}
            <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
              <div className="flex flex-wrap gap-8 text-base" style={{ color: 'var(--color-muted-foreground)' }}>
                <div className="flex items-center gap-2">
                  <img src="/images/vodafone-icon.webp" alt="Vodafone" className="inline w-5 h-5" /> Vodafone
                </div>
                <div className="flex items-center gap-2">
                  <img src="/images/anadolubank-icon.png" alt="Anadolubank" className="inline w-5 h-5" /> Anadolubank
                </div>
              </div>
            </div>
            <ul className="space-y-6 list-none">
              <li className="text-lg mb-4" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Javascript, React.js, React Native</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 4 x 4 hours
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 7-8-14-15 November 2022
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/vodafone-icon.webp" alt="Vodafone" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">React.js</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 6 hours
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 05.02.2020
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/anadolubank-icon.png" alt="Anadolubank" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
              <li className="text-lg mb-8" style={{ color: 'var(--color-foreground)' }}>
                <strong className="text-xl">Javascript</strong>
                <div className="mt-2 mb-4 flex flex-wrap gap-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon /> 2 x 6 hours
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> 28.01.2020-29.01.2020
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon />
                  </span>
                  <span className="flex items-center gap-1">
                    <img src="/images/anadolubank-icon.png" alt="Anadolubank" className="inline w-5 h-5" />
                  </span>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
