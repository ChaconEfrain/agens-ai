import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Box, Check, File, FileText, Info, Smile } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormWizardData } from "./form-wizard";

interface SummaryProps {
  form: UseFormReturn<FormWizardData>;
}

export default function Summary({ form }: SummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>Summary</h2>
        </CardTitle>
        <CardDescription>
          <p>Review the information you've provided for your AI chatbot.</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            General Information <Info />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-muted-foreground">Business Name</p>
              <p>{form.getValues("generalInfo.businessName")}</p>
            </div>
            <div>
              <p className=" font-medium text-muted-foreground">Websites</p>
              <p>
                {form
                  .getValues("generalInfo.allowedWebsites")
                  .map(({ url }: { url: string }) => url)
                  .join(", ")}
              </p>
            </div>
            <div>
              <p className=" font-medium text-muted-foreground">Founded</p>
              <p>
                {form.getValues("generalInfo.foundedYear") || "Not provided"}
              </p>
            </div>
          </div>
          <div>
            <p className=" font-medium text-muted-foreground">Description</p>
            <p className="">{form.getValues("generalInfo.description")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            Products & Services
            <Box />
          </h3>
          <div>
            <p className=" font-medium text-muted-foreground">
              Business Offers
            </p>
            <p className="capitalize">
              {form.getValues("productsServices.type")}
            </p>
          </div>
          {form.getValues("hasPhysicalProducts") && (
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <p>Sells physical products that require shipping</p>
            </div>
          )}
          {(form.getValues("productsServices.items") ?? []).length > 0 && (
            <div>
              <p className=" font-medium text-muted-foreground mb-2">
                {form.getValues("productsServices.type") === "services"
                  ? "Services"
                  : form.getValues("productsServices.type") === "products"
                  ? "Products"
                  : "Products & Services"}{" "}
                ({(form.getValues("productsServices.items") ?? []).length})
              </p>
              <ul className="space-y-1 ">
                {(form.getValues("productsServices.items") ?? []).map(
                  (item, index) => (
                    <li key={index}>{item.name}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>

        {form.getValues("hasPhysicalProducts") && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shipping & Logistics</h3>
            {form.getValues("shippingLogistics.shippingMethods") && (
              <div>
                <p className=" font-medium text-muted-foreground">
                  Shipping Methods
                </p>
                <p>{form.getValues("shippingLogistics.shippingMethods")}</p>
              </div>
            )}
            {form.getValues("shippingLogistics.deliveryTimeframes") && (
              <div>
                <p className=" font-medium text-muted-foreground">
                  Delivery Timeframes
                </p>
                <p className="">
                  {form.getValues("shippingLogistics.deliveryTimeframes")}
                </p>
              </div>
            )}
            {form.getValues("shippingLogistics.returnPolicy") && (
              <div>
                <p className=" font-medium text-muted-foreground">
                  Return Policy
                </p>
                <p className="">
                  {form.getValues("shippingLogistics.returnPolicy")}
                </p>
              </div>
            )}
            {form.getValues("shippingLogistics.internationalShipping") && (
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-primary" />
                <p>Offers international shipping</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            Customer Service
            <Smile />
          </h3>
          {form.getValues("customerService.supportHours") && (
            <div>
              <p className=" font-medium text-muted-foreground">
                Support Hours
              </p>
              <p>{form.getValues("customerService.supportHours")}</p>
            </div>
          )}
          {(form.getValues("customerService.contactMethods") ?? []).length >
            0 && (
            <div>
              <p className=" font-medium text-muted-foreground">
                Contact Methods
              </p>
              <p>
                {(form.getValues("customerService.contactMethods") ?? []).join(
                  ", "
                )}
              </p>
            </div>
          )}
          {form.getValues("customerService.responseTime") && (
            <div>
              <p className=" font-medium text-muted-foreground">
                Response Time
              </p>
              <p>{form.getValues("customerService.responseTime")}</p>
            </div>
          )}
          {(form.getValues("customerService.commonQuestions") ?? []).length >
            0 && (
            <div>
              <p className=" font-medium text-muted-foreground mb-2">
                Common Questions (
                {
                  (form.getValues("customerService.commonQuestions") ?? [])
                    .length
                }
                )
              </p>
              <ul className="space-y-1 ">
                {(form.getValues("customerService.commonQuestions") ?? []).map(
                  (qa: any, index: number) => (
                    <li key={index}>{qa.question}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>

        {(form.getValues("documents") ?? []).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              Additional Documents
              <File />
            </h3>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <p>
                {(form.getValues("documents") ?? []).length} document
                {(form.getValues("documents") ?? []).length !== 1
                  ? "s"
                  : ""}{" "}
                uploaded
              </p>
            </div>
            <ul className="space-y-1 ">
              {(form.getValues("documents") ?? []).map(
                (doc: any, index: number) => (
                  <li key={index}>{doc.name}</li>
                )
              )}
            </ul>
          </div>
        )}

        <div className="bg-primary/10 rounded-md p-4 mt-6">
          <h3 className="font-medium text-primary mb-2">Next Steps</h3>
          <p className="">
            Your chatbot configuration is complete! Our AI system will now
            process this information to create a customized chatbot for your
            business. You'll receive a notification when your chatbot is ready
            for testing and deployment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
