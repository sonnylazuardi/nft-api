export default async (req, res) => {
  const slug = req?.query?.slug;
  if (!slug) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false }));
    return;
  }

  const result = await fetch(
    `https://api.thegraph.com/subgraphs/name/ensdomains/ens`,
    {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query:
          "\n  query lookup($name: String!) {\n    domains(\n      where: { name: $name }\n    ) {\n      resolvedAddress {\n        id\n      }\n    }\n  }\n",
        variables: { name: slug },
      }),
    }
  ).then((res) => res.json());

  let address = null;
  try {
    address = result.data.domains[0].resolvedAddress.id;
  } catch (e) {}

  const result2 = await fetch(
    `https://api.opensea.io/api/v1/assets?owner=${address}&limit=50&offset=0`
  ).then((res) => res.json());

  let images = [];

  try {
    result2.assets.forEach((v) => {
      images.push(v.image_preview_url);
    });
  } catch (e) {}

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ address, images }));
};
