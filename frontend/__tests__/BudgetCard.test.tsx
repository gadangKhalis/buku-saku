import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BudgetCard from "../components/BudgetCard";

const baseBudget = {
  id: "budget-1",
  limitIDR: 1000000,
  totalSpent: 500000,
  usagePercent: 50,
  remaining: 500000,
  isWarning: false,
  isExceeded: false,
  category: {
    name: "Makanan",
    icon: "utensils",
    color: "#F87171",
  },
};

describe("BudgetCard", () => {
  it("must render category name", () => {
    render(
      <BudgetCard budget={baseBudget} onEdit={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText("Makanan")).toBeInTheDocument();
  });
});

it("must render percentage usage", () => {
  render(
    <BudgetCard budget={baseBudget} onEdit={() => {}} onDelete={() => {}} />,
  );
  expect(screen.getByText("50%")).toBeInTheDocument();
});

it("no show warning or exceeded message when usage is normal", () => {
  render(
    <BudgetCard budget={baseBudget} onEdit={() => {}} onDelete={() => {}} />,
  );
  expect(screen.queryByText(/Warning/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Exceeded/i)).not.toBeInTheDocument();
});

it("must show Exceeded message when isExceeded is true", () => {
  const exceededBudget = { ...baseBudget, usagePercent: 110, isExceeded: true };
  render(
    <BudgetCard
      budget={exceededBudget}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  );
  expect(screen.getByText(/Exceeded/i)).toBeInTheDocument();
  expect(screen.queryByText(/Warning/i)).not.toBeInTheDocument();
});

it("must call onEdit when edit button is clicked", async () => {
  const onEdit = jest.fn();
  render(
    <BudgetCard budget={baseBudget} onEdit={onEdit} onDelete={() => {}} />,
  );
  const buttons = screen.getAllByRole("button");
  await userEvent.click(buttons[0]);
  expect(onEdit).toHaveBeenCalledTimes(1);
});

it("must call onDelete when delete button is clicked", async () => {
  const onDelete = jest.fn();
  render(
    <BudgetCard budget={baseBudget} onEdit={() => {}} onDelete={onDelete} />,
  );
  const buttons = screen.getAllByRole("button");
  await userEvent.click(buttons[1]);
  expect(onDelete).toHaveBeenCalledTimes(1);
});
