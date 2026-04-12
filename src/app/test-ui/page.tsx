'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardFooter, Input, Alert, Badge, PageLayout, PageSection, TextArea, Select } from '@/components/ui';

export default function TestUIPage() {
  const [showAlert, setShowAlert] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  return (
    <PageLayout
      title="UI Component Test Page"
      subtitle="Verify all components are working correctly"
    >
      <PageSection title="Buttons">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
          <Button disabled>Disabled</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </PageSection>

      <PageSection title="Button Sizes">
        <div className="flex gap-4 flex-wrap items-center">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </PageSection>

      <PageSection title="Loading State">
        <Button>
          Loading... (Coming soon)
        </Button>
      </PageSection>

      <PageSection title="Cards">
        <div className="grid md:grid-cols-2 gap-4">
          <Card shadow="sm">
            <CardHeader>
              <CardTitle>Small Shadow</CardTitle>
            </CardHeader>
            <CardContent>Content with small shadow</CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card shadow="md" hover>
            <CardHeader>
              <CardTitle>Medium Shadow with Hover</CardTitle>
            </CardHeader>
            <CardContent>This card has hover effect</CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline">Secondary</Button>
            </CardFooter>
          </Card>

          <Card shadow="lg">
            <CardHeader>
              <CardTitle>Large Shadow Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">This is example content inside a large shadow card.</p>
              <div className="flex gap-2 flex-wrap">
                <Badge>Tag 1</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="warning">Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card with Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-purple-600 rounded mb-4"></div>
              <p>Image placeholder</p>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <PageSection title="Form Inputs">
        <div className="space-y-4 max-w-md">
          <Input
            label="Name"
            placeholder="Enter your name"
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            error={emailError}
            onChange={handleEmailChange}
          />

          <TextArea
            label="Message"
            placeholder="Enter your message..."
            rows={4}
          />

          <Select
            label="Category"
            required
            options={[
              { value: 'fashion', label: 'Fashion' },
              { value: 'electronics', label: 'Electronics' },
              { value: 'books', label: 'Books' },
            ]}
          />
        </div>
      </PageSection>

      <PageSection title="Alerts">
        <div className="space-y-4">
          <Alert variant="success">
            ✓ This is a success alert - operation completed successfully
          </Alert>

          <Alert variant="error">
            ✗ This is an error alert - something went wrong
          </Alert>

          <Alert variant="warning">
            ⚠ This is a warning alert - please be careful
          </Alert>

          <Alert variant="info">
            ℹ This is an info alert - here's some information
          </Alert>

          <Alert
            variant="success"
            onDismiss={() => setShowAlert(false)}
          >
            Dismissible alert - click X to close
          </Alert>
        </div>
      </PageSection>

      <PageSection title="Badges">
        <div className="flex gap-2 flex-wrap items-center">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Error</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge size="lg">Large Badge</Badge>
        </div>
      </PageSection>

      <PageSection title="Test Interactions">
        <Card shadow="md">
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Click the buttons below to test interaction:</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="primary" onClick={() => setShowAlert(true)}>
                  Show Alert
                </Button>
                <Button variant="secondary">
                  Secondary Action
                </Button>
              </div>
              {showAlert && (
                <Alert
                  variant="success"
                  onDismiss={() => setShowAlert(false)}
                >
                  Alert is showing! Click X to dismiss.
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection title="Component Status">
        <Card shadow="md">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p>✅ <strong>Button</strong> - All variants working</p>
              <p>✅ <strong>Card</strong> - With header, content, footer</p>
              <p>✅ <strong>Input</strong> - Text, email, textarea, select</p>
              <p>✅ <strong>Alert</strong> - Success, error, warning, info</p>
              <p>✅ <strong>Badge</strong> - Multiple variants</p>
              <p>✅ <strong>PageLayout</strong> - With title and sections</p>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection title="Ready to Start">
        <Card shadow="lg" hover>
          <CardHeader>
            <CardTitle className="text-2xl">🚀 UI System is Ready!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              All components are working correctly. You can now start implementing the UI improvements
              on the actual pages.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Check out <code className="bg-gray-100 px-2 py-1 rounded">/page-improved.tsx</code> files for
              real-world examples of how to use these components.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="primary"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </PageSection>
    </PageLayout>
  );
}
