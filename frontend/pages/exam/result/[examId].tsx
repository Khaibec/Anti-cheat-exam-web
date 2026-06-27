import { Button } from "@mui/material";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import ExamResultView from "../../../components/exam/exam-result";
import NavBarDashboard from "../../../components/dashboard/navbar-dashboard";
import { getExamResult } from "../../../helpers/api/user-api";
import { getDashboardPath, isStudent } from "../../../helpers/auth/roles";
import { ExamResult } from "../../../models/exam-models";

interface ExamResultPageProps {
  result: ExamResult | null;
  error: string | null;
}

const ExamResultPage: React.FC<ExamResultPageProps> = ({ result, error }) => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

  if (error || !result) {
    return <p>{error || "Result not found"}</p>;
  }

  return (
    <div>
      <Head>
        <title>{result.examName} - Result</title>
      </Head>
      <LoadingBar color="#ffffff" ref={loadingBarRef} />
      <NavBarDashboard loadingBarRef={loadingBarRef} />
      <ExamResultView result={result} />
      <ContainerBackButton loadingBarRef={loadingBarRef} />
    </div>
  );
};

const ContainerBackButton = ({
  loadingBarRef,
}: {
  loadingBarRef: React.RefObject<LoadingBarRef>;
}) => (
  <div style={{ textAlign: "center", paddingBottom: "3rem" }}>
    <Link href="/dashboard">
      <Button
        variant="contained"
        onClick={() => loadingBarRef.current?.continuousStart(50)}
      >
        Back to Dashboard
      </Button>
    </Link>
  </div>
);

const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  if (!isStudent(session.user.role)) {
    return {
      redirect: {
        destination: getDashboardPath(session.user.role),
        permanent: false,
      },
    };
  }

  const { examId } = context.params;
  const attempt = context.query.attempt
    ? Number(context.query.attempt)
    : undefined;

  try {
    const result = await getExamResult(
      session.user.id,
      examId.toString(),
      session.user.token,
      attempt
    );

    return {
      props: {
        result,
        error: null,
      },
    };
  } catch (e) {
    return {
      props: {
        result: null,
        error: e.message ?? "Failed to load exam result!",
      },
    };
  }
};

export default ExamResultPage;
export { getServerSideProps };
