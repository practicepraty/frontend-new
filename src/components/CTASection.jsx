import { Link } from 'react-router-dom'

const CTASection = () => {
    return (
        <section className="cta-section">
            <div className="container">
                <div className="cta-content fade-in">
                    <h2>Ready to Build Your Medical Website?</h2>
                    <p>Join hundreds of healthcare professionals who have transformed their online presence with DoctorSite Builder.</p>
                    <Link to="/builder" className="btn-primary">Start Building Now</Link>
                </div>
            </div>
        </section>
    )
}

export default CTASection
