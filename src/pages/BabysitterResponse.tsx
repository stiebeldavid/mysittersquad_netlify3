import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { verifyBabysitterRequest, updateBabysitterResponse } from "@/lib/airtable";
import { VerificationForm } from "@/components/babysitter-response/VerificationForm";
import { ResponseForm } from "@/components/babysitter-response/ResponseForm";
import { SuccessMessage } from "@/components/babysitter-response/SuccessMessage";

const BabysitterResponse = () => {
  const { requestId } = useParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [request, setRequest] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: ({ response, comments }: { response: string; comments: string }) => {
      if (!request?.id) return Promise.reject("Invalid data");
      return updateBabysitterResponse(request.id, {
        status: response === "yes" ? "Available" : "Declined",
        response: `${response === "yes" ? "Yes, I can babysit then" : "No, I am not available then"}${
          comments ? `. ${comments}` : ""
        }`,
      });
    },
    onSuccess: () => {
      toast.success("Response submitted successfully!");
      setIsSubmitted(true);
    },
    onError: () => {
      toast.error("Failed to submit response. Please try again.");
    },
  });

  const handleVerify = async (mobile: string) => {
    try {
      setIsVerifying(true);
      const result = await verifyBabysitterRequest(requestId || "", mobile);
      
      if (!result) {
        toast.error("Could not find that babysitting request");
      } else {
        setRequest(result);
      }
    } catch (error) {
      toast.error("Invalid mobile number format");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (response: string, comments: string) => {
    mutation.mutate({ response, comments });
  };

  if (isVerifying) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      {isSubmitted && request?.parent ? (
        <SuccessMessage parent={request.parent} />
      ) : !request ? (
        <VerificationForm onVerify={handleVerify} isVerifying={isVerifying} />
      ) : (
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">
                Welcome {request.babysitterFirstName}!
              </h2>
              {request.parent && (
                <p className="text-lg text-center text-muted-foreground">
                  {request.parent.firstName} {request.parent.lastName} sent you a Babysitting Request
                </p>
              )}
              <CardTitle>Babysitting Request Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Date and Time</h3>
              <p>{format(parseISO(request.date), "EEEE, MMMM d, yyyy")}</p>
              <p>{request.timeRange}</p>
              {request.notes && (
                <div className="mt-4">
                  <h3 className="font-medium">Additional Notes</h3>
                  <p className="text-muted-foreground">{request.notes}</p>
                </div>
              )}
            </div>
            <ResponseForm 
              request={request}
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BabysitterResponse;