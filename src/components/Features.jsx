const Features = () => {
    const features = [
        {
            icon: "fas fa-microphone",
            title: "Voice-Powered Creation",
            description: "Simply record yourself describing your practice, services, and approach. Our AI transcribes and transforms your words into professional website content."
        },
        {
            icon: "fas fa-robot",
            title: "AI Content Generation",
            description: "Advanced AI analyzes your specialty and generates relevant, professional content including service descriptions, about sections, and patient information."
        },
        {
            icon: "fas fa-palette",
            title: "Medical-Focused Design",
            description: "Choose from professionally designed templates created specifically for healthcare practices. Customize colors, fonts, and layouts to match your brand."
        },
        {
            icon: "fas fa-shield-alt",
            title: "HIPAA Compliant",
            description: "Built with healthcare regulations in mind. Your data and your patients' information are handled with the highest security standards."
        },
        {
            icon: "fas fa-rocket",
            title: "Instant Publishing",
            description: "Go live with one click. Your website is automatically optimized for speed, mobile devices, and search engines."
        },
        {
            icon: "fas fa-chart-line",
            title: "Practice Analytics",
            description: "Track visitor engagement, appointment requests, and website performance with our built-in analytics dashboard."
        }
    ];

    return (
        <section className="features" id="features">
            <div className="container">
                <div className="section-title fade-in">
                    <h2>Why Choose DoctorSite Builder?</h2>
                    <p>Revolutionary features designed specifically for medical professionals who want a stunning online presence without the technical complexity.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card fade-in">
                            <div className="feature-icon">
                                <i className={feature.icon}></i>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
