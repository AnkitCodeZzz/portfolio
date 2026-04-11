import { notFound, redirect } from "next/navigation";

export default function NewProjectEditPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  redirect("/work/case-study/new/edit");
}
