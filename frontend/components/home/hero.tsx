import React from "react";
import classes from "./home.module.scss";
import { Button, Container, Stack } from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LoginIcon from "@mui/icons-material/Login";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LoadingBarRef } from "react-top-loading-bar";
import { getDashboardPath } from "../../helpers/auth/roles";

interface HeroProps {
  loadingBarRef: React.RefObject<LoadingBarRef>;
}

const Hero: React.FC<HeroProps> = ({ loadingBarRef }) => {
  const session = useSession();

  const showLoadingWidget = () => {
    loadingBarRef.current.continuousStart(50);
  };

  return (
    <React.Fragment>
      <section className={classes.heroSection}>
        <Container maxWidth="md">
          <Stack
            direction="column"
            alignItems="center"
            spacing={0}
          >
            <div className={classes.heroText}>
              <h1>Online Exams Made Fairer</h1>

              <p>
                Detect cheating with AI-powered face detection and real-time monitoring.
              </p>

              <Stack direction="row" className={classes.buttonGroup}>
                {session.status === "authenticated" ? (
                  <Link href="/dashboard">
                    <Button
                      startIcon={<ArrowOutwardIcon />}
                      variant="contained"
                      size="large"
                      color="primary"
                      onClick={showLoadingWidget}
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button
                      startIcon={<LoginIcon />}
                      variant="contained"
                      size="large"
                      color="primary"
                      disabled={session.status === "loading"}
                      onClick={showLoadingWidget}
                    >
                      Login
                    </Button>
                  </Link>
                )}
              </Stack>
            </div>
          </Stack>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default Hero;
