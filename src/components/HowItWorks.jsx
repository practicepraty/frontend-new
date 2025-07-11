const HowItWorks = () => {
    const steps = [
        {
            number: "1",
            title: "Record Your Practice",
            description: "Use our voice interface to describe your medical practice, services, experience, and what makes you unique. Speak naturally - our AI understands medical terminology."
        },
        {
            number: "2",
            title: "AI Creates Your Site",
            description: "Our advanced AI analyzes your recording, generates professional content, and selects the perfect template based on your specialty and preferences."
        },
        {
            number: "3",
            title: "Customize & Publish",
            description: "Fine-tune your website with our easy customization tools. Add your logo, adjust colors, upload images, and publish with a single click."
        }
    ];

    return (
        <section className="how-it-works" id="how-it-works">
            <div className="container">
                <div className="section-title fade-in">
                    <h2>How It Works</h2>
                    <p>Three simple steps to your professional medical website</p>
                </div>
                <div className="steps">
                    {steps.map((step, index) => (
                        <div key={index} className="step fade-in">
                            <div className="step-number">{step.number}</div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
