import React from "react";
import { Table } from "@mantine/core";

export const PaymentSummary = ({
    credits,
    price,
  }: {
    credits: number;
    price: number;
  }) => {
    return (
      <Table fontSize={"xs"}>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{credits} credits</td>
            <td>${price}</td>
          </tr>
        </tbody>
      </Table>
    );
  };