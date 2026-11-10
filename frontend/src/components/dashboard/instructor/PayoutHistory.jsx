import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Status configuration (colours and labels)
const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

const statusIcon = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  paid: <CheckCircle2 className="h-4 w-4" />,
};

const money = (value, currency = "USD") =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

export function PayoutHistory({ requests }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Payout Request History</span>
          <Badge variant="secondary" className="ml-auto">
            {requests.length} requests
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              No payout requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => {
              const status = statusConfig[item.status] || statusConfig.pending;
              const Icon = statusIcon[item.status] || statusIcon.pending;

              return (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  {/* Row: amount, date, status */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">
                        {money(item.amount, item.currency)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge
                      className={`${status.color} flex items-center gap-1 border px-3 py-1 text-xs`}
                    >
                      {Icon}
                      {status.label}
                    </Badge>
                  </div>

                  {/* Payment details (if provided) */}
                  {item.payment_details && (
                    <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm">
                      <p className="font-medium text-muted-foreground">
                        Payment Details
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">
                        {item.payment_details}
                      </p>
                    </div>
                  )}

                  {/* Rejection reason – highlighted with an alert box */}
                  {item.rejection_reason && (
                    <Alert
                      variant="destructive"
                      className="mt-3 border-red-300 bg-red-50"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <span className="font-medium">Rejection reason:</span>{" "}
                        {item.rejection_reason}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
