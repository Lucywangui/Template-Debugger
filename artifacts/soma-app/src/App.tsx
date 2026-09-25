import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { useSomaStore } from "./lib/storage";
import { resolveGrade } from "./lib/gradeUtils";

import WelcomePage from "./pages/WelcomePage";
import NamePage from "./pages/NamePage";
import GradePage from "./pages/GradePage";
import SchoolPage from "./pages/SchoolPage";
import IntentPage from "./pages/IntentPage";
import PathwayPage from "./pages/PathwayPage";
import AvatarPage from "./pages/AvatarPage";
import DashboardPage from "./pages/DashboardPage";
import DeveloperLoginPage from "./pages/DeveloperLoginPage";
import DeveloperDashboardPage from "./pages/DeveloperDashboardPage";

import ViewerModal from "./components/ViewerModal";

type PageState =
  | "welcome"
  | "name"
  | "grade"
  | "school"
  | "intent"
  | "pathway"
  | "avatar"
  | "dashboard"
  | "developer-login"
  | "developer-dashboard";

function App() {
  const {
    name,
    grade,
    schoolName,
    studyIntent,
    avatar,
    logout,
  } = useSomaStore();

  const [currentPage, setCurrentPage] =
    useState<PageState>("welcome");

  const [viewerMaterialId, setViewerMaterialId] =
    useState<string | null>(null);

  const [developerLoggedIn, setDeveloperLoggedIn] =
    useState(false);

  /*
   * Check the normal student onboarding state.
   */
  useEffect(() => {
    if (developerLoggedIn) {
      return;
    }

    if (!name) {
      setCurrentPage("welcome");
      return;
    }

    if (!grade) {
      setCurrentPage("grade");
      return;
    }

    if (!schoolName) {
      setCurrentPage("school");
      return;
    }

    if (!studyIntent) {
      setCurrentPage("intent");
      return;
    }

    if (!avatar) {
      setCurrentPage("avatar");
      return;
    }

    setCurrentPage("dashboard");
  }, [
    name,
    grade,
    schoolName,
    studyIntent,
    avatar,
    developerLoggedIn,
  ]);

  /*
   * If the student logs out, return to onboarding.
   */
  useEffect(() => {
    if (
      !name &&
      !grade &&
      !schoolName &&
      !studyIntent &&
      !avatar &&
      currentPage === "dashboard"
    ) {
      setCurrentPage("welcome");
      setViewerMaterialId(null);
    }
  }, [
    name,
    grade,
    schoolName,
    studyIntent,
    avatar,
    currentPage,
  ]);

  /*
   * Developer login.
   */
  function openDeveloperLogin() {
    setCurrentPage("developer-login");
  }

  /*
   * Developer successfully logged in.
   */
  function handleDeveloperLogin() {
    setDeveloperLoggedIn(true);
    setCurrentPage("developer-dashboard");
  }

  /*
   * Developer logout.
   */
  function handleDeveloperLogout() {
    setDeveloperLoggedIn(false);
    setCurrentPage("developer-login");
  }

  /*
   * Student logout.
   */
  function handleStudentLogout() {
    logout();
    setViewerMaterialId(null);
    setDeveloperLoggedIn(false);
    setCurrentPage("welcome");
  }

  /*
   * Change grade from the dashboard.
   */
  function handleChangeGrade() {
    setCurrentPage("grade");
  }

  /*
   * Open a study material.
   */
  function handleOpenViewer(materialId: string) {
    setViewerMaterialId(materialId);
  }

  /*
   * Close the study material viewer.
   */
  function handleCloseViewer() {
    setViewerMaterialId(null);
  }

  /*
   * Developer pages must be shown independently from
   * the normal student onboarding flow.
   */
  if (currentPage === "developer-login") {
    return (
      <>
        <DeveloperLoginPage
          onLogin={handleDeveloperLogin}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  if (currentPage === "developer-dashboard") {
    return (
      <>
        <DeveloperDashboardPage
          onLogout={handleDeveloperLogout}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  /*
   * Welcome page.
   *
   * The developer entry is intentionally kept separate
   * from the normal student onboarding flow.
   */
  if (currentPage === "welcome") {
    return (
      <>
        <WelcomePage
          onContinue={() => setCurrentPage("name")}
          onDeveloperLogin={openDeveloperLogin}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  if (currentPage === "name") {
    return (
      <>
        <NamePage
          onContinue={() => setCurrentPage("grade")}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  if (currentPage === "grade") {
    return (
      <>
        <GradePage
          onContinue={() => setCurrentPage("school")}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  if (currentPage === "school") {
    return (
      <>
        <SchoolPage
          onContinue={() => setCurrentPage("intent")}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  if (currentPage === "intent") {
    return (
      <>
        <IntentPage
          onContinue={() => setCurrentPage("pathway")}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  if (currentPage === "pathway") {
    return (
      <>
        <PathwayPage
          onContinue={() => setCurrentPage("avatar")}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  if (currentPage === "avatar") {
    return (
      <>
        <AvatarPage
          onContinue={() => setCurrentPage("dashboard")}
        />

        <Toaster position="top-center" />
      </>
    );
  }

  /*
   * Main student dashboard.
   */
  return (
    <>
      <DashboardPage
        onOpenViewer={handleOpenViewer}
        onChangeGrade={handleChangeGrade}
        onLogout={handleStudentLogout}
      />

      {viewerMaterialId && (
        <ViewerModal
          materialId={viewerMaterialId}
          onClose={handleCloseViewer}
        />
      )}

      <Toaster position="top-center" />
    </>
  );
}

export default App;