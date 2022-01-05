import Image from "next/image";

export default function handler(req, res) {
  res.end(
    <Image
      src="https://storage.opensea.io/files/b23a9c05057c1527e8c9db24f5f28532.svg"
      alt="Picture of the author"
      width={500}
      height={500}
    />
  );
}
