import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRef, useState } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import Link from "next/link";
import ExamReviewPanel from "../../../../../../components/admin/exam-review";
import NavBarAdmin from "../../../../../../components/admin/navbar-admin";
import {
  ExamReviewData,
  getExamReview,
} from "../../../../../../helpers/api/admin-api";
import { getDashboardPath, isAdmin } from "../../../../../../helpers/auth/roles";

interface ExamReviewPageProps {
  review: ExamReviewData | null;
  sessionToken: string | null;
  error: string | null;
}

const ExamReviewPage: React.FC<ExamReviewPageProps> = ({
  review,
  sessionToken,
  error,
}) => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);
  const [reviewData, setReviewData] = useState(review);

  if (error || !reviewData || !sessionToken) {
    return <p>{error || "Review not found"}</p>;
  }

  return (
    <div>
      <Head>
        <title>
          Review {reviewData.student.fname} — {reviewData.exam.name}
        </title>
      </Head>
      <LoadingBar color="#ffffff" ref={loadingBarRef} />
      <NavBarAdmin loadingBarRef={loadingBarRef} />
      <ExamReviewPanel
        review={reviewData}
        token={sessionToken}
        onUpdated={setReviewData}
      />
    </div>
  );
};

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

  if (!isAdmin(session.user.role)) {
    return {
      redirect: {
        destination: getDashboardPath(session.user.role),
        permanent: false,
      },
    };
  }

  const { studentId, examId } = context.params;

  try {
    const review = await getExamReview(
      session.user.token,
      studentId.toString(),
      examId.toString()
    );

    return {
      props: {
        review,
        sessionToken: session.user.token,
        error: null,
      },
    };
  } catch (e) {
    return {
      props: {
        review: null,
        sessionToken: null,
        error: e.message ?? "Failed to load exam review!",
      },
    };
  }
};

export default ExamReviewPage;
export { getServerSideProps };
