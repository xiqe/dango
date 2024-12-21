import "@douyinfe/semi-ui/dist/css/semi.min.css";
import "@/styles/root.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Spin } from "@douyinfe/semi-ui";
import authStore from "./stores/AuthStore";
import Layout from "./components/Layout";
import Review from "./pages/Review";
import Word from "./pages/Word";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
  return authStore.user ? element : <Navigate to="/login" replace />;
};

const App = observer(() => {
  const { t } = useTranslation();

  if (authStore.loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip={t("common.loading")} />
      </div>
    );
  }

  if (!authStore.user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PrivateRoute element={<Review />} />} />
        <Route path="/word" element={<PrivateRoute element={<Word />} />} />
        <Route
          path="/profile"
          element={<PrivateRoute element={<Profile />} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
});

export default App;
