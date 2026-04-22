import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container main-content">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
