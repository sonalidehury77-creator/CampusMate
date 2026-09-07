"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] =
    useState(false);

  const { toast } = useToast();

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-brand-600">
          CampusMate UI
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Design System
        </h1>

        <p className="mt-2 text-slate-500">
          Reusable components used throughout CampusMate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>
            Standard CampusMate button variants.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Button>Primary</Button>

          <Button variant="secondary">
            Secondary
          </Button>

          <Button variant="outline">
            Outline
          </Button>

          <Button variant="ghost">
            Ghost
          </Button>

          <Button variant="danger">
            Danger
          </Button>

          <Button loading>
            Loading
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Badge>Default</Badge>

          <Badge variant="success">
            Success
          </Badge>

          <Badge variant="warning">
            Warning
          </Badge>

          <Badge variant="danger">
            Danger
          </Badge>

          <Badge variant="info">
            Information
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form controls</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
          <Input placeholder="Enter something..." />

          <Select defaultValue="">
            <option value="" disabled>
              Select an option
            </option>

            <option value="student">
              Student
            </option>

            <option value="faculty">
              Faculty
            </option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs
            tabs={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <p className="text-sm text-slate-600">
                    Overview content.
                  </p>
                ),
              },
              {
                id: "details",
                label: "Details",
                content: (
                  <p className="text-sm text-slate-600">
                    Details content.
                  </p>
                ),
              },
              {
                id: "settings",
                label: "Settings",
                content: (
                  <p className="text-sm text-slate-600">
                    Settings content.
                  </p>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell>
                  Data Structures
                </TableCell>

                <TableCell>
                  <Badge variant="success">
                    Active
                  </Badge>
                </TableCell>

                <TableCell>72%</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  Database Management
                </TableCell>

                <TableCell>
                  <Badge variant="warning">
                    In progress
                  </Badge>
                </TableCell>

                <TableCell>54%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
        </CardHeader>

        <CardContent>
          <Button
            onClick={() =>
              setDialogOpen(true)
            }
          >
            Open dialog
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() =>
          setDialogOpen(false)
        }
        title="CampusMate Dialog"
        description="Reusable dialog component."
      >
        <p className="text-sm leading-6 text-slate-600">
          This component can later be used for
          editing profiles, adding assignments,
          creating tasks, and many other actions.
        </p>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() =>
              setDialogOpen(false)
            }
          >
            Close
          </Button>
        </div>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Toast notifications</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              toast(
                "Profile saved successfully.",
                "success",
              )
            }
          >
            Success toast
          </Button>

          <Button
            variant="danger"
            onClick={() =>
              toast(
                "Something went wrong.",
                "error",
              )
            }
          >
            Error toast
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              toast(
                "This is an information message.",
                "info",
              )
            }
          >
            Info toast
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loading state</CardTitle>
        </CardHeader>

        <CardContent>
          <LoadingState label="Loading CampusMate data..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empty state</CardTitle>
        </CardHeader>

        <CardContent>
          <EmptyState
            title="No assignments yet"
            description="Your assignments will appear here once they are added."
          />
        </CardContent>
      </Card>
    </div>
  );
}