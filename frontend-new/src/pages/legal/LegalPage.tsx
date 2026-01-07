import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, PageContainer, PageTitle } from '@/components/globalComponents';

const LegalPage: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Legal Information</PageTitle>
          <p className='text-muted-foreground mt-1'>
            Review our terms, privacy policy, and cookie policy.
          </p>
        </div>
      </PageHeader>

      <div className='mx-auto max-w-4xl w-full'>
        <Tabs defaultValue='terms' className='w-full space-y-6'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='terms'>Terms of Service</TabsTrigger>
            <TabsTrigger value='privacy'>Privacy Policy</TabsTrigger>
            <TabsTrigger value='cookies'>Cookie Policy</TabsTrigger>
          </TabsList>

          <TabsContent value='privacy'>
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>1. Introduction</h3>
                  <p className='text-muted-foreground'>
                    Welcome to Ayphen Textile. We respect your privacy and are committed to
                    protecting your personal data. This privacy policy will inform you as to how we
                    look after your personal data when you visit our website and tell you about your
                    privacy rights and how the law protects you.
                  </p>
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>2. Data We Collect</h3>
                  <p className='text-muted-foreground mb-2'>
                    We may collect, use, store and transfer different kinds of personal data about
                    you which we have grouped together follows:
                  </p>
                  <ul className='list-disc pl-5 space-y-1 text-muted-foreground'>
                    <li>
                      Identity Data includes first name, last name, username or similar identifier.
                    </li>
                    <li>
                      Contact Data includes billing address, delivery address, email address and
                      telephone numbers.
                    </li>
                    <li>
                      Technical Data includes internet protocol (IP) address, your login data,
                      browser type and version.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='cookies'>
            <Card>
              <CardHeader>
                <CardTitle>Cookie Policy</CardTitle>
                <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>What are cookies?</h3>
                  <p className='text-muted-foreground'>
                    Cookies are small text files that are used to store small pieces of information.
                    They are stored on your device when the website is loaded on your browser.
                  </p>
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>How do we use cookies?</h3>
                  <p className='text-muted-foreground mb-2'>We use cookies for several reasons:</p>
                  <ul className='list-disc pl-5 space-y-1 text-muted-foreground'>
                    <li>
                      Necessary cookies: These cookies are essential for you to be able to use some
                      features of our website.
                    </li>
                    <li>
                      Functionality cookies: These cookies allow our website to remember choices you
                      have made in the past.
                    </li>
                    <li>
                      Analytics cookies: These cookies collect information about how you use our
                      website.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='terms'>
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
                <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>1. Agreement to Terms</h3>
                  <p className='text-muted-foreground'>
                    By accessing our website, you agree to be bound by these Terms of Service and to
                    comply with all applicable laws and regulations.
                  </p>
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>2. Use License</h3>
                  <p className='text-muted-foreground'>
                    Permission is granted to temporarily download one copy of the materials
                    (information or software) on Ayphen Textile's website for personal,
                    non-commercial transitory viewing only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default LegalPage;
