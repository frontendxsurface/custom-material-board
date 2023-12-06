import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import MaterialBoard from "../conponents/MaterialBoard";

export default function Home() {
  return (
    <div style={{ padding: "0 40px" }}>
      <h1>Material Board Example</h1>
      <MaterialBoard />
    </div>
  );
}
