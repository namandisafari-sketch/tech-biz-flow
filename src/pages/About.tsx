import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">About the Developer</h1>
          <p className="text-muted-foreground mt-1">
            The story behind Tech Biz Track
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4 text-foreground leading-relaxed">
              <p className="text-lg font-semibold italic">
                "Where development meets creativity - alone in my room."
              </p>
              
              <p>
                After I presented my templates and drafts to people who were not happy to see me coming out with such a project, I held my breath and decided to print out this masterpiece. Thanks to those who helped me with resources to see that I complete my project.
              </p>

              <div className="border-l-4 border-primary pl-4 space-y-3">
                <p>
                  My special thanks goes to <span className="font-semibold">Musumba Guitta of Kasangati</span> for the strong words he motivated me with.
                </p>

                <p>
                  I bow down to thank the <span className="font-semibold">Dotcom Brothers Ltd of Kasangati</span> for every bit of support they added to me every time.
                </p>

                <p>
                  Thanks to <span className="font-semibold">Ddamba Ramdhan</span> for his sleepless nights to see that our app logo looked nice and spoke a million words.
                </p>
              </div>

              <p className="text-lg font-bold mt-6">
                If you think you can take down this app, then you will have to first kill God.
              </p>

              <p className="text-right text-lg font-semibold text-primary mt-6">
                I will always be Creator Jagonix44
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
