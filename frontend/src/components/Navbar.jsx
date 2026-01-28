import '../App.css'
import  { Calculator } from 'lucide-react'
import logo from '../assets/logo.png'

function Navbar() {
  return (
    <>
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <div className="logo-icon">
                        <img src={logo} alt="logo" className="logo-img" />
                    </div>
                    <div>
                        <h1 className="logo-title">Crypto Tax Calculator</h1>
                        <p className="subtitle">SARS FIFO Calculations for South African Taxpayers</p>
                    </div>
                </div>
            </div>
        </header>
    </>
  )
}

export default Navbar