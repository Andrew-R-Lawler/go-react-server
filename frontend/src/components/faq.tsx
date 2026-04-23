import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"

function FAQ() {
    const navigate = useNavigate()
    const faqs = [
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for all unused items in their original packaging. Please contact our support team to initiate a return."
        },
        {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 3-5 business days. Express options are available at checkout."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes, we ship to most countries worldwide. International shipping rates and times vary by location."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order ships, you will receive a confirmation email with a tracking number and link to monitor your shipment."
        },
        {
            question: "Are your products eco-friendly?",
            answer: "We strive to use sustainable materials and packaging wherever possible. Check individual product descriptions for specific details."
        },
        {
            question: "Can I cancel my order?",
            answer: "Orders can be canceled within 1 hour of placement. After that, they are processed for shipping and cannot be canceled, but can be returned."
        }
    ]

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 lg:px-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="mb-6">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Frequently Asked Questions</h1>
                    <p className="text-muted-foreground text-lg">
                        Find answers to common questions about our products, shipping, and policies.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Card key={index} className="bg-card border-border overflow-hidden transition-all duration-200 hover:border-primary/50">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full text-left"
                            >
                                <CardHeader className="flex flex-row items-center justify-between p-6">
                                    <CardTitle className="text-lg font-medium text-foreground">
                                        {faq.question}
                                    </CardTitle>
                                    {openIndex === index ? (
                                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-200" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                                    )}
                                </CardHeader>
                            </button>
                            {openIndex === index && (
                                <CardContent className="px-6 pb-6 pt-0 text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
                                    {faq.answer}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                <Separator className="my-8" />

                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Still have questions?</p>
                    <a href="/contact" className="inline-block text-primary font-medium hover:underline underline-offset-4">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    )
}

export default FAQ
