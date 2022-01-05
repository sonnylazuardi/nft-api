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
  let svgs = [];
  let svgImages = [];

  try {
    result2.assets.forEach((v) => {
      if (v?.image_preview_url) {
        if (v.image_preview_url?.includes(".svg")) {
          svgs.push(v.image_preview_url);
        } else {
          images.push(v.image_preview_url);
        }
      }
    });

    svgImages = await Promise.all(
      svgs.map((v) =>
        fetch(v).then((res) => {
          return res.text();
        })
      )
    ).then((data) => data);
  } catch (e) {
    console.log(e);
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ address, images, svgImages }));
};
