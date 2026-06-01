import { Routes, Route } from 'react-router-dom';
import { TripProvider } from './contexts/TripContext';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import BillsPage from './pages/BillsPage';
import Layout from './components/Layout';

export default function App() {
  return (
    <TripProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path="/trip/:id" element={<TripPage />} />
          <Route path="/trip/:id/bills" element={<BillsPage />} />
        </Route>
      </Routes>
    </TripProvider>
  );
}
