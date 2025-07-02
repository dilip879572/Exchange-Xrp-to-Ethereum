import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Market from './Pages/Market/Market';
import Trade from "./Pages/Trade/Trade";
import Header from "./Layouts/Header/Header";
import Footer from './Layouts/Footer/Footer';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/markets' element={<Market />} />
        <Route path='/markets/trade' element={<Trade />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
