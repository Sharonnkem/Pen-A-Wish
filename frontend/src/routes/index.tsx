import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { NotFoundPage } from "../pages/errors/NotFoundPage";
import { RouteErrorPage } from "../pages/errors/RouteErrorPage";
import { ServerErrorPage } from "../pages/errors/ServerErrorPage";

const LandingPage = lazy(() => import("../pages/public/LandingPage").then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("../pages/auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage").then((module) => ({ default: module.ResetPasswordPage })));

const DashboardHomePage = lazy(() => import("../pages/dashboard/DashboardHomePage").then((module) => ({ default: module.DashboardHomePage })));
const MyCelebrationsPage = lazy(() => import("../pages/dashboard/MyCelebrationsPage").then((module) => ({ default: module.MyCelebrationsPage })));
const CreateCelebrationPage = lazy(() => import("../pages/dashboard/CreateCelebrationPage").then((module) => ({ default: module.CreateCelebrationPage })));
const CelebrationDetailsPage = lazy(() => import("../pages/dashboard/CelebrationDetailsPage").then((module) => ({ default: module.CelebrationDetailsPage })));
const EditCelebrationPage = lazy(() => import("../pages/dashboard/EditCelebrationPage").then((module) => ({ default: module.EditCelebrationPage })));
const EventGuestbookPage = lazy(() => import("../pages/dashboard/EventGuestbookPage").then((module) => ({ default: module.EventGuestbookPage })));
const WallStudioPage = lazy(() => import("../pages/dashboard/WallStudioPage").then((module) => ({ default: module.WallStudioPage })));
const WalletPage = lazy(() => import("../pages/dashboard/WalletPage").then((module) => ({ default: module.WalletPage })));
const WithdrawalRequestPage = lazy(() => import("../pages/dashboard/WithdrawalRequestPage").then((module) => ({ default: module.WithdrawalRequestPage })));
const TransactionHistoryPage = lazy(() => import("../pages/dashboard/TransactionHistoryPage").then((module) => ({ default: module.TransactionHistoryPage })));
const AccountSettingsPage = lazy(() => import("../pages/dashboard/AccountSettingsPage").then((module) => ({ default: module.AccountSettingsPage })));

const AdminHomePage = lazy(() => import("../pages/admin/AdminHomePage").then((module) => ({ default: module.AdminHomePage })));
const AdminWithdrawalsPage = lazy(() => import("../pages/admin/AdminWithdrawalsPage").then((module) => ({ default: module.AdminWithdrawalsPage })));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const AdminCelebrationsPage = lazy(() => import("../pages/admin/AdminCelebrationsPage").then((module) => ({ default: module.AdminCelebrationsPage })));
const AdminWishesPage = lazy(() => import("../pages/admin/AdminWishesPage").then((module) => ({ default: module.AdminWishesPage })));
const AdminReportsPage = lazy(() => import("../pages/admin/AdminReportsPage").then((module) => ({ default: module.AdminReportsPage })));
const AdminGiftsPage = lazy(() => import("../pages/admin/AdminGiftsPage").then((module) => ({ default: module.AdminGiftsPage })));

const PublicEventPage = lazy(() => import("../pages/public/PublicEventPage").then((module) => ({ default: module.PublicEventPage })));
const PublicWishWallPage = lazy(() => import("../pages/public/PublicWishWallPage").then((module) => ({ default: module.PublicWishWallPage })));
const WishWallExportPage = lazy(() => import("../pages/public/WishWallExportPage").then((module) => ({ default: module.WishWallExportPage })));
const PaymentSuccessPage = lazy(() => import("../pages/public/PaymentSuccessPage").then((module) => ({ default: module.PaymentSuccessPage })));
const PaymentFailedPage = lazy(() => import("../pages/public/PaymentFailedPage").then((module) => ({ default: module.PaymentFailedPage })));
const PrivacyPolicyPage = lazy(() => import("../pages/public/PrivacyPolicyPage").then((module) => ({ default: module.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import("../pages/public/TermsOfServicePage").then((module) => ({ default: module.TermsOfServicePage })));
const ContactPage = lazy(() => import("../pages/public/ContactPage").then((module) => ({ default: module.ContactPage })));
const UiSystemPage = lazy(() => import("../pages/UiSystemPage").then((module) => ({ default: module.UiSystemPage })));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <RouteErrorPage />
  },
  {
    element: <PublicOnlyRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "dashboard",
        element: <DashboardHomePage />
      },
      {
        path: "celebrations",
        element: <MyCelebrationsPage />
      },
      {
        path: "celebrations/new",
        element: <CreateCelebrationPage />
      },
      {
        path: "celebrations/:id",
        element: <CelebrationDetailsPage />
      },
      {
        path: "celebrations/:id/edit",
        element: <EditCelebrationPage />
      },
      {
        path: "celebrations/:id/guestbook",
        element: <EventGuestbookPage />
      },
      {
        path: "celebrations/:id/wall",
        element: <WallStudioPage />
      },
      {
        path: "wallet",
        element: <WalletPage />
      },
      {
        path: "wallet/withdrawals",
        element: <WithdrawalRequestPage />
      },
      {
        path: "wallet/transactions",
        element: <TransactionHistoryPage />
      },
      {
        path: "settings",
        element: <AccountSettingsPage />
      }
    ]
  },
  {
    element: <AdminRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "admin",
        element: <AdminHomePage />
      },
      {
        path: "admin/withdrawals",
        element: <AdminWithdrawalsPage />
      },
      {
        path: "admin/users",
        element: <AdminUsersPage />
      },
      {
        path: "admin/celebrations",
        element: <AdminCelebrationsPage />
      },
      {
        path: "admin/wishes",
        element: <AdminWishesPage />
      },
      {
        path: "admin/reports",
        element: <AdminReportsPage />
      },
      {
        path: "admin/gifts",
        element: <AdminGiftsPage />
      }
    ]
  },
  {
    path: "/events/:slug",
    element: <PublicEventPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/events/:slug/wall",
    element: <PublicWishWallPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/exports/wish-wall",
    element: <WishWallExportPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/payment/failed",
    element: <PaymentFailedPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicyPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/terms-of-service",
    element: <TermsOfServicePage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/contact",
    element: <ContactPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/500",
    element: <ServerErrorPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "/ui-system",
    element: <UiSystemPage />,
    errorElement: <RouteErrorPage />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
