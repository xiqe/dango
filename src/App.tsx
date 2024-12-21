import { Routes, Route } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import rootStore from "@/stores/RootStore";
import Home from "@/pages/Home";

const App = observer(() => {
  const { t } = useTranslation();
  const { isLoading } = rootStore;

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
});

export default App;
