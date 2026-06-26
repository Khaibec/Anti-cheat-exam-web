import { GetStaticProps } from "next";
import { useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
// Removed: Contact, Features, Footer components per request
import Hero from "../components/home/hero";
import NavBarHome from "../components/home/navbar-home";

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = ({}) => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

  return (
    <>
      <LoadingBar color="#1665C0" ref={loadingBarRef} />

      <NavBarHome loadingBarRef={loadingBarRef} />
      <Hero loadingBarRef={loadingBarRef} />
      {/* Features, Contact, Footer removed */}
    </>
  );
};

const getStaticProps: GetStaticProps = (context) => {
  return {
    props: {},
  };
};

export default HomePage;
export { getStaticProps };
