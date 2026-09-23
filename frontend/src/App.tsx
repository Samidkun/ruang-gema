import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Landing from './screens/Landing';
import ServiceList from './screens/ServiceList';
import BookingForm from './screens/BookingForm';
import BookingSuccess from './screens/BookingSuccess';
import AdminDashboard from './screens/AdminDashboard';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

/** Route table mirrors the P2.0 screen inventory (landing → ruangan → booking → sukses → admin). */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ruangan" element={<ServiceList />} />
          <Route path="/booking" element={<BookingForm />} />
          <Route path="/booking/:code" element={<BookingSuccess />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
