import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function AboutUs() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Hero Section */}
            <div className="bg-muted py-8 md:py-16 animate-in fade-in duration-700">
                <div className="max-w-7xl mx-auto px-6 mb-8">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">About Us</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        We are crafting the future of natural skincare. Driven by a passion for the earth, botanical innovation, and a commitment to purity.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">
                {/* Our Mission */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold border-l-4 border-primary pl-4">Our Mission</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Welcome to Eco Theory, where our passion for natural living meets the art of artisanal soap making. Founded on the principle that self-care should not come at the expense of our planet, we strive to bring you the purest elements of nature in every bar.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            We believe that beauty routines shouldn't burden the earth. That's why we meticulously source natural, cruelty-free ingredients and package everything in biodegradable materials.
                        </p>
                    </div>
                    <div className="bg-muted aspect-video rounded-lg flex items-center justify-center text-muted-foreground bg-stone-100 dark:bg-stone-800">
                        {/* Placeholder for an image */}
                        <span className="italic">Mission Image Placeholder</span>
                    </div>
                </section>

                {/* Our Values - 3 Card Grid */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-12">Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Sustainability", icon: "🌱", desc: "Dedicated to eco-friendly practices and reducing our environmental footprint" },
                            { title: "Integrity", icon: "🤝", desc: "Honest sourcing and transparent ingredients in everything we make" },
                            { title: "Quality", icon: "✨", desc: "Handcrafted in small batches to ensure the highest standards of purity" }
                        ].map((value, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 bg-card border-border">
                                <CardHeader>
                                    <div className="text-4xl mb-4">{value.icon}</div>
                                    <CardTitle>{value.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{value.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Our Story */}
                <section className="bg-muted/30 p-8 md:p-12 rounded-2xl border border-border">
                    <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto text-center">
                        Our ingredients are ethically harvested from sustainable sources, ensuring that we support local communities and protect biodiversity. From the organic shea butter that heals your skin to the wild-crafted lavender that soothes your mind, every aspect of our product is designed with intention and respect for the environment.
                    </p>
                </section>
            </main>
        </div>
    )
}

export default AboutUs
