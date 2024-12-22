import { Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Spin } from "@douyinfe/semi-ui";
import authStore from "./stores/AuthStore";
import Layout from "./components/Layout";
import Review from "./pages/Review";
import Add from "./pages/Add";
import Word from "./pages/Word";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import "@/styles/root.css";

const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
  return authStore.user ? element : <Navigate to="/login" replace />;
};

const App = observer(() => {
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
        <Spin size="large" />
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
        <Route path="/add" element={<PrivateRoute element={<Add />} />} />
        <Route path="/word" element={<PrivateRoute element={<Word />} />} />
        <Route
          path="/profile"
          element={<PrivateRoute element={<Profile />} />}
        />
        <Route
          path="/change-password"
          element={<PrivateRoute element={<ChangePassword />} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
});

export default App;
