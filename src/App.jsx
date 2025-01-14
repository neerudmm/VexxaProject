import "../src/styles/main.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Performance from "./pages/Performance";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
    const appname = "Vexxa AB Job Portal";
    const user = "Neeraja Kurmam";
    const role = "Administrator";

    return (
        <Router>
            <div className="App">
            <Header appname={appname} user={user} role={role} />
                <div className="main-content">
                <Sidebar />
                    <div className="content">
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/news" element={<News />} />
                            <Route path="/performance" element={<Performance />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="/transactions" element={<Transactions />} />
                        </Routes>

                    </div>
                        <Footer />

                </div>

            </div>
        </Router>
    );
}

export default App;
