import fs from "node:fs";
import path from "node:path";

const project = JSON.parse(
  fs.readFileSync("project.json", "utf8")
);

const out = "showcase";
fs.mkdirSync(out, { recursive: true });

const features = project.features
  .map((feature) => `- ${feature}`)
  .join("\n");

const technologies = project.techStack
  .map((tech) => `\`${tech}\``)
  .join(", ");

const readme = `# ${project.name}

${project.description}

## Live demo
${project.liveUrl || "Not yet deployed"}

## Source code
${project.repoUrl}

## Technology stack
${technologies}

## Features
${features}

## Screenshots
See the generated showcase artifacts.
`;

const linkedin = `🚀 Introducing ${project.name}!

${project.description}

Key features:
${features}

Built with: ${project.techStack.join(", ")}.

Live demo: ${project.liveUrl || "Coming soon"}
Source code: ${project.repoUrl}

#WebDevelopment #SoftwareEngineering #BuildInPublic #PWA
`;

const card = {
  name: project.name,
  description: project.description,
  liveUrl: project.liveUrl,
  repoUrl: project.repoUrl,
  portfolioUrl: project.portfolioUrl,
  techStack: project.techStack,
  features: project.features,
  assets: {
    screenshots: "screenshots/",
    testResults: "test-results/"
  },
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(
  path.join(out, "README.md"),
  readme
);

fs.writeFileSync(
  path.join(out, "linkedin.md"),
  linkedin
);

fs.writeFileSync(
  path.join(out, "project-card.json"),
  JSON.stringify(card, null, 2)
);

console.log("Showcase documentation generated.");
