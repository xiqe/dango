import { observer } from "mobx-react-lite";
// import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const Home = observer(() => {
  // const { t } = useTranslation();

  useEffect(() => {}, []);

  return (
    <div className="container">
      <h1>Welcome to Home Page</h1>
      <p>This is a template with React + Vite + MobX + i18n + Firebase</p>
    </div>
  );
});

export default Home;
