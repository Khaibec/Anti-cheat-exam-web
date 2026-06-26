import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import AdminDashboard from "../../../components/admin/admin-dashboard";
import NavBarAdmin from "../../../components/admin/navbar-admin";
import {
  AdminExam,
  AdminStudent,
  getExams,
  getStats,
  getStudents,
  AdminStats,
} from "../../../helpers/api/admin-api";
import { getDashboardPath, isAdmin } from "../../../helpers/auth/roles";

interface AdminDashboardPageProps {
  students: AdminStudent[];
  exams: AdminExam[];
  stats: AdminStats;
  error: string | null;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  students,
  exams,
  stats,
  error,
}) => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <Head>
        <title>Admin Dashboard - Anti-Cheat Exam App</title>
      </Head>
      <LoadingBar color="#ffffff" ref={loadingBarRef} />
      <NavBarAdmin loadingBarRef={loadingBarRef} />
      <AdminDashboard
        initialStudents={students}
        initialExams={exams}
        initialStats={stats}
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

  try {
    const [students, exams, stats] = await Promise.all([
      getStudents(session.user.token),
      getExams(session.user.token),
      getStats(session.user.token),
    ]);

    return {
      props: {
        students,
        exams,
        stats,
        error: null,
      },
    };
  } catch (e) {
    return {
      props: {
        students: [],
        exams: [],
        stats: {
          managedStudentsCount: 0,
          totalSubmissions: 0,
          averagePercentage: 0,
          examStats: [],
          submissions: [],
        },
        error: e.message ?? "Failed to load admin data!",
      },
    };
  }
};

export default AdminDashboardPage;
export { getServerSideProps };
