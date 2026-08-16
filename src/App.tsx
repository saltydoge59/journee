import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Show, RedirectToSignIn } from "@clerk/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar/navigation-menu";
import Landing from "@/routes/Landing";
import SignInPage from "@/routes/SignInPage";
import SignUpPage from "@/routes/SignUpPage";
import Trips from "@/routes/Trips";
import AddTrip from "@/routes/AddTrip";
import Dates from "@/routes/Dates";
import Day from "@/routes/Day";
import Snapspot from "@/routes/Snapspot";

function ProtectedLayout() {
  return (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
      <Outlet />
    </Show>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BrowserRouter>
        <div className="flex h-screen w-screen flex-col overflow-hidden">
          <Show when="signed-in">
            <Navbar />
          </Show>
          <div className="min-h-0 flex-1 overflow-y-auto pb-[60px] sm:pb-0">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/sign-in/*" element={<SignInPage />} />
              <Route path="/sign-up/*" element={<SignUpPage />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/trips" element={<Trips />} />
                <Route path="/add_trip" element={<AddTrip />} />
                <Route path="/dates" element={<Dates />} />
                <Route path="/day" element={<Day />} />
                <Route path="/snapspot" element={<Snapspot />} />
              </Route>
            </Routes>
          </div>
        </div>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}
