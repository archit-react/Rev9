import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MainLayout from "../layout/MainLayout";
import { MemoryRouter } from "react-router-dom";

describe("MainLayout", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("toggles dark mode on button click", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    const toggleButton = screen.getByTestId("dark-mode-toggle");

    // Initially should be in light mode (moon icon)
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
    expect(localStorage.getItem("theme")).toBe("light"); // ✅ Updated line

    // Enable dark mode
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    // Disable dark mode
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("renders all navigation links", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-users")).toBeInTheDocument();
    expect(screen.getByTestId("nav-settings")).toBeInTheDocument();
  });

  it("renders admin avatar and welcome text", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    expect(screen.getByTestId("admin-avatar")).toBeInTheDocument();
    expect(screen.getByText("Welcome, Admin")).toBeInTheDocument();
  });
});
