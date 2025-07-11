import { Link } from 'react-router-dom'

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Build Your Medical Practice Website in Minutes</h1>
                <p>The first AI-powered website builder designed exclusively for healthcare professionals. Simply describe your practice, and watch your professional website come to life.</p>
                <div className="hero-buttons">
                    <Link to="/builder" className="btn-primary">Start Building Free</Link>
                    <a href="#demo" className="btn-secondary">Watch Demo</a>
                </div>
            </div>
        </section>
    )
}

export default Hero
