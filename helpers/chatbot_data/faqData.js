const faqData = {
  questions: [
    {
      question: "How do I start my study abroad process?",
      answer: `
        <div class="text-left space-y-4">
          <p>Getting started is simple and stress-free. Follow these two steps:</p>
          <ol class="list-decimal pl-5">
            <li><strong>Book a Counseling Session:</strong> Schedule a free consultation so we can understand your goals, academic background, and career aspirations.</li>
            <li><strong>Personalized Roadmap:</strong> Receive a tailored plan that outlines your study options, application process, and next steps.</li>
          </ol>
          <div class="flex justify-center mt-4">
            <img src="https://via.placeholder.com/300x150?text=Start+Your+Journey" alt="Start Your Journey" class="rounded-lg max-w-full">
          </div>
        </div>
      `,
      followUp: [
        "How can I apply for a study abroad program?",
        "What documents do I need to get started?",
        "Would you like to know about our successful students?",
      ],
    },
    {
      question: "How can I apply for a study abroad program?",
      answer: `
        <div class="text-left space-y-4">
          <p>You can easily apply by following these steps:</p>
          <ul class="list-disc pl-5">
            <li>Book a counseling session with our expert advisors.</li>
            <li>Get assistance with documentation, including SOP, LORs, and transcripts.</li>
            <li>Receive guidance on application timelines and requirements.</li>
          </ul>
          <p>Our streamlined process ensures that your application is submitted flawlessly to top global universities.</p>
          <br/>
          <a class="font-semibold" style="color: #2563eb;" href="https://viacertaabroad.com/services" target="_blank">
            📞 Book Counseling Session Now.
          </a>
        </div>
      `,
      followUp: [
        "What documents do I need to get started?",
        "Can I choose more than one country for my studies?",
      ],
    },
    {
      question: "What documents do I need to get started?",
      answer: `
        <div class="text-left space-y-4">
          <p>Typically, you will need the following documents:</p>
          <ul class="list-disc pl-5">
            <li>Academic transcripts and certificates</li>
            <li>Proof of language proficiency (IELTS/TOEFL scores)</li>
            <li>Letters of Recommendation (LORs)</li>
            <li>A well-crafted Statement of Purpose (SOP)</li>
          </ul>
          <p>Our counselors will guide you in preparing all necessary documentation tailored to your chosen programs.</p>
        </div>
      `,
      followUp: ["How do I prepare a compelling Statement of Purpose (SOP)?"],
    },
    {
      question: "Can I choose more than one country for my studies?",
      answer: `
        <div class="text-left space-y-4">
          <p class="font-semibold">Your choice is limitless!</p>
          <p>We empower you to:</p>
          <ul class="list-disc pl-5">
            <li>Explore multiple countries based on your interests and career goals.</li>
            <li>Compare course offerings, tuition fees, and cultural experiences side-by-side.</li>
          </ul>
          <div class="bg-gray-100 p-3 rounded mt-4">
            <p><em>Tip:</em> List your preferred countries and let our counselors help you select the best match!</p>
          </div>
        </div>
      `,
      followUp: ["Which countries do you offer study programs in?"],
    },
    {
      question: "Which countries do you offer study programs in?",
      answer: `
        <div class="text-left space-y-4">
          <p>We partner with institutions across the globe. Our key destinations include:</p>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse mt-4">
              <thead class="bg-gray-200">
                <tr>
                  <th class="border p-2 text-left">Country</th>
                  <th class="border p-2 text-left">Highlights</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border p-2">USA</td>
                  <td class="border p-2">Top-ranked universities, research opportunities, diverse culture.</td>
                </tr>
                <tr>
                  <td class="border p-2">Germany</td>
                  <td class="border p-2">Affordable education, strong engineering and technology programs.</td>
                </tr>
                <tr>
                  <td class="border p-2">Australia</td>
                  <td class="border p-2">Vibrant campuses, excellent research facilities, post-study work options.</td>
                </tr>
                <tr>
                  <td class="border p-2">UK</td>
                  <td class="border p-2">Historic institutions, global networking, scholarship opportunities.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `,
      followUp: [],
    },
    {
      question: "How do I prepare a compelling Statement of Purpose (SOP)?",
      answer: `
        <div class="text-left space-y-4">
          <p>Your SOP is your story. Here’s how we help you craft one that stands out:</p>
          <ul class="list-disc pl-5">
            <li>Highlight your academic achievements and future goals.</li>
            <li>Showcase your unique experiences and extracurriculars.</li>
            <li>Explain why you are the perfect fit for your chosen program.</li>
          </ul>
          <p>We offer expert reviews and templates to guide you through the writing process.</p>
        </div>
      `,
      followUp: ["What financial aid options are available?"],
    },
    {
      question: "What financial aid options are available?",
      answer: `
        <div class="text-left space-y-4">
          <p>We guide you through multiple financial support options, including:</p>
          <ul class="list-disc pl-5">
            <li>Merit-based and need-based scholarships</li>
            <li>Student loans and education grants</li>
            <li>Flexible payment plans and installment options</li>
          </ul>
          <p>Our counselors help you identify and apply for the best options suited to your profile.</p>
        </div>
      `,
      followUp: ["What services does ViaCerta Abroad provide?"],
    },
    {
      question: "What services does ViaCerta Abroad provide?",
      answer: `
        <div class="text-left space-y-4">
          <p>At ViaCerta Abroad, we offer a full spectrum of services to make your global education journey smooth and successful:</p>
          <ul class="list-disc pl-5">
            <li><strong>Counseling & Career Guidance:</strong> Personalized sessions to map your academic and career goals.</li>
            <li><strong>Customized Application Support:</strong> Assistance with document preparation, SOPs, and LORs.</li>
            <li><strong>Visa & Immigration Assistance:</strong> Step-by-step help with visa applications and legal documentation.</li>
            <li><strong>Scholarship & Financial Aid:</strong> Guidance to secure both partial and fully funded scholarships.</li>
            <li><strong>Pre-departure Briefing:</strong> Information on accommodation, cultural integration, and work opportunities.</li>
          </ul>
          <div class="flex justify-center mt-4">
            <img src="https://via.placeholder.com/250x150?text=Our+Services" alt="Our Services" class="rounded-lg max-w-full">
          </div>
        </div>
      `,
      followUp: ["How long does the visa process take?"],
    },
    {
      question: "How long does the visa process take?",
      answer: `
        <div class="text-left space-y-4">
          <p>The duration of the visa process depends on various factors, including the destination country and your individual circumstances. Typically:</p>
          <ul class="list-disc pl-5">
            <li><strong>Short-term visas:</strong> 2-4 weeks</li>
            <li><strong>Student visas:</strong> 1-3 months</li>
            <li><strong>Work visas:</strong> 2-4 months</li>
          </ul>
          <p>We work closely with you to ensure all documentation is in order, reducing delays and stress.</p>
        </div>
      `,
      followUp: ["What are the eligibility criteria for studying abroad?"],
    },
    {
      question: "What are the eligibility criteria for studying abroad?",
      answer: `
        <div class="text-left space-y-4">
          <p>Eligibility requirements can vary by program and country, but generally include:</p>
          <ul class="list-disc pl-5">
            <li><strong>Academic Records:</strong> Transcripts and certificates from your previous education.</li>
            <li><strong>Language Proficiency:</strong> Proof through tests like IELTS or TOEFL.</li>
            <li><strong>Standardized Test Scores:</strong> Such as SAT, GRE, or GMAT if required.</li>
            <li><strong>Financial Proof:</strong> Evidence of funding or scholarship support.</li>
          </ul>
          <p>Our advisors will guide you through the specific criteria based on your chosen destination and program.</p>
        </div>
      `,
      followUp: ["Can I work while studying abroad?"],
    },
    {
      question: "Can I work while studying abroad?",
      answer: `
        <div class="text-left space-y-4">
          <p>Yes! Many countries allow international students to work part-time during their studies. This not only helps with living expenses but also enhances your global work experience.</p>
          <p>Our services include guidance on work permit regulations, securing internships, and post-study work visa support.</p>
        </div>
      `,
      followUp: ["Do I need to take English proficiency tests?"],
    },
    {
      question: "Do I need to take English proficiency tests?",
      answer: `
        <div class="text-left space-y-4">
          <p>Most international programs require proof of English proficiency. Common tests include:</p>
          <ul class="list-disc pl-5">
            <li>IELTS</li>
            <li>TOEFL</li>
            <li>PTE Academic</li>
          </ul>
          <p>If you need help preparing for these tests, we offer resources and guidance to help you achieve the required scores.</p>
        </div>
      `,
      followUp: ["How do I get started with work visa processing?"],
    },
    {
      question: "How do I get started with work visa processing?",
      answer: `
        <div class="text-left space-y-4">
          <p>Starting your work visa process is as simple as following these steps:</p>
          <ol class="list-decimal pl-5">
            <li>Consult with our visa experts to understand country-specific requirements.</li>
            <li>Gather all necessary documents such as academic records, proof of work experience, and financial statements.</li>
            <li>Submit your application and prepare for interviews or biometric submissions.</li>
          </ol>
          <p>Our team is here to streamline the process and keep you updated on any changes in visa policies.</p>
        </div>
      `,
      followUp: ["What support do you provide for job placements abroad?"],
    },
    {
      question: "What support do you provide for job placements abroad?",
      answer: `
        <div class="text-left space-y-4">
          <p>We offer comprehensive job placement support that includes:</p>
          <ul class="list-disc pl-5">
            <li>Resume building and interview preparation workshops</li>
            <li>Access to top online job portals and recruiter networks</li>
            <li>Career counseling and post-study guidance for a seamless transition</li>
          </ul>
          <div class="flex justify-center mt-4">
            <img src="https://via.placeholder.com/250x150?text=Job+Placement+Support" alt="Job Placement Support" class="rounded-lg max-w-full">
          </div>
        </div>
      `,
      followUp: ["What kind of career counseling do you offer?"],
    },
    {
      question: "What kind of career counseling do you offer?",
      answer: `
        <div class="text-left space-y-4">
          <p>Our career counseling services are designed to help you identify your strengths, explore in-demand career paths, and receive personalized advice on upskilling and networking.</p>
          <p>We ensure every step is aligned with your academic and professional ambitions.</p>
        </div>
      `,
      followUp: [],
    },
    {
      question: "Would you like to know about our successful students?",
      answer: `
        <div class="text-left space-y-4">
          <h1>Below are Our Success students.</h1>
                 </div>
      `,
      followUp: [],
    },
  ],
};

export default faqData;
