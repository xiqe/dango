import { Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Spin } from "@douyinfe/semi-ui";
import authStore from "./stores/AuthStore";
import { Layout } from "@/components";
import Review from "./pages/Review";
import Add from "./pages/Add";
import Practise from "./pages/Practise";
import Word from "./pages/Word";
import WordDetail from "./pages/WordDetail";
import GroupSetting from "./pages/GroupSetting";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import EmailVerification from "./pages/EmailVerification";
import "@/styles/root.css";

const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
  if (!authStore.user) {
    return <Navigate to="/login" replace />;
  }

  if (!authStore.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return element;
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

  if (!authStore.isEmailVerified) {
    return (
      <Routes>
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="*" element={<Navigate to="/verify-email" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PrivateRoute element={<Review />} />} />
        <Route
          path="/practise"
          element={<PrivateRoute element={<Practise />} />}
        />
        <Route path="/add" element={<PrivateRoute element={<Add />} />} />
        <Route path="/word" element={<PrivateRoute element={<Word />} />} />
        <Route path="/word/:id" element={<WordDetail />} />
        <Route path="/word/group-setting" element={<GroupSetting />} />
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
