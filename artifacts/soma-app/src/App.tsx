import { useState, useEffect } from "react";
import { useSomaStore } from "@/lib/storage";

import { WelcomePage } from "./pages/WelcomePage";
import { NamePage } from "./pages/NamePage";
import { GradePage } from "./pages/GradePage";
import { AvatarPage } from "./pages/AvatarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ViewerModal } from "./components/ViewerModal";
import { Toaster } from "./components/ui/toaster";

type PageState = "welcome" | "name" | "grade" | "avatar" | "dashboard";

function App() {
  const [currentPage, setCurrentPage] = useState<PageState>("welcome");
  const [viewerMaterialId, setViewerMaterialId] = useState<string | null>(null);

  const { name, avatar, grade } = useSomaStore();

  useEffect(() => {
    if (name && avatar && grade) {
      setCurrentPage("dashboard");
    } else if (name && avatar && !grade) {
      setCurrentPage("grade");
    } else if (name && !avatar) {
      setCurrentPage("grade");
    } else if (!name) {
      setCurrentPage("welcome");
    }
  }, []);

  const navigateTo = (page: PageState) => setCurrentPage(page);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
      {currentPage === "welcome" && <WelcomePage onNext={() => navigateTo("name")} />}
      {currentPage === "name" && <NamePage onNext={() => navigateTo("grade")} />}
      {currentPage === "grade" && <GradePage onNext={() => navigateTo("avatar")} />}
      {currentPage === "avatar" && <AvatarPage onNext={() => navigateTo("dashboard")} />}
      {currentPage === "dashboard" && (
        <DashboardPage
          onOpenViewer={setViewerMaterialId}
          onChangeGrade={() => navigateTo("grade")}
        />
      )}

      {viewerMaterialId && (
        <ViewerModal materialId={viewerMaterialId} onClose={() => setViewerMaterialId(null)} />
      )}

      <Toaster />
    </div>
  );
}

export default App;
