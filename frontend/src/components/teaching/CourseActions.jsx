import React, { useState } from "react";
import { toast } from "sonner";
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useMutation } from "@/hooks/dashboard/useMutation";
import { useRouter } from "next/navigation";
import { deleteCourseApi } from "@/lib/api/instructor";

/**
 * Course row/card actions. Shared by the grid card and the list table so the
 * behaviour (and the delete confirmation) exists in exactly one place.
 */
export function CourseActions({ course, onChanged }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useMutation((id) => deleteCourseApi(id));

  async function handleDelete() {
    const result = await deleteMutation.mutate(course.id);
    if (result.ok) {
      setConfirmOpen(false);
      toast.success(`“${course.title}” was deleted`);
      onChanged?.();
    } else if (result.error) {
      toast.error(result.error.message);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${course.title}`}
          >
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {course.approval_status === "approved" && (
            <DropdownMenuItem
              onSelect={() => router.push(`/courses/${course.slug}`)}
            >
              <EyeIcon aria-hidden="true" />
              View
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() =>
              router.push(`/dashboard/teaching/courses/${course.id}`)
            }
          >
            <PencilIcon aria-hidden="true" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash2Icon aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              “{course.title}” and its curriculum will be removed permanently.
              if this course has students enrolled, you can’t delete it. Please
              contact support if you need to remove this course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.pending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.pending}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {deleteMutation.pending ? "Deleting…" : "Delete course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
