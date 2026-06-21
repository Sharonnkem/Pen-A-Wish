import { createBrowserRouter } from "react-router-dom";

import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import {
  AdminCelebrationsPage,
  AdminGiftsPage,
  AdminHomePage,
  AdminReportsPage,
  AdminUsersPage,
  AdminWithdrawalsPage,
  AdminWishesPage
} from "../pages/admin";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { AccountSettingsPage } from "../pages/dashboard/AccountSettingsPage";
import { CelebrationDetailsPage } from "../pages/dashboard/CelebrationDetailsPage";
import { CreateCelebrationPage } from "../pages/dashboard/CreateCelebrationPage";
import { DashboardHomePage } from "../pages/dashboard/DashboardHomePage";
import { EventGuestbookPage } from "../pages/dashboard/EventGuestbookPage";
import { EditCelebrationPage } from "../pages/dashboard/EditCelebrationPage";
import { MyCelebrationsPage } from "../pages/dashboard/MyCelebrationsPage";
import { TransactionHistoryPage } from "../pages/dashboard/TransactionHistoryPage";
import { WalletPage } from "../pages/dashboard/WalletPage";
import { WallStudioPage } from "../pages/dashboard/WallStudioPage";
import { WithdrawalRequestPage } from "../pages/dashboard/WithdrawalRequestPage";
import { NotFoundPage } from "../pages/errors/NotFoundPage";
import { RouteErrorPage } from "../pages/errors/RouteErrorPage";
import { ServerErrorPage } from "../pages/errors/ServerErrorPage";
import { ContactPage } from "../pages/public/ContactPage";
import { PublicEventPage } from "../pages/public/PublicEventPage";
import { LandingPage } from "../pages/public/LandingPage";
import { PaymentFailedPage } from "../pages/public/PaymentFailedPage";
import { PaymentSuccessPage } from "../pages/public/PaymentSuccessPage";
import { PrivacyPolicyPage } from "../pages/public/PrivacyPolicyPage";
import { PublicWishWallPage } from "../pages/public/PublicWishWallPage";
import { WishWallExportPage } from "../pages/public/WishWallExportPage";
import { TermsOfServicePage } from "../pages/public/TermsOfServicePage";
import { UiSystemPage } from "../pages/UiSystemPage";

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
