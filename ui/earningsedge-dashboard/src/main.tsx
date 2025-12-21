import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"

import AppShell from "./app/AppShell"
import Overview from "./pages/Overview"
import PpoVsBaselines from "./pages/PpoVsBaselines"
import ErrorAnalysis from "./pages/ErrorAnalysis"
import Experiments from "./pages/Experiments"

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Overview /> },
      { path: "ppo-vs-baselines", element: <PpoVsBaselines /> },
      { path: "error-analysis", element: <ErrorAnalysis /> },
      { path: "experiments", element: <Experiments /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
