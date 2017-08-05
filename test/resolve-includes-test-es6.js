import dasm from "./../lib/index";
import { resolveIncludes } from "./../lib/index";
import * as fs from "fs";
import * as path from "path";

function bufferToArray(b) {
	const arr = new Uint8Array(b.length);
	return arr.map((v, i) => b[i]);
}

function resolveIncludesFromFileSystem(baseDir) {
	return (uri, isBinary) => {
		const fullUri = path.join(__dirname, baseDir, uri);
		if (fs.existsSync(fullUri)) {
			if (isBinary) {
				return bufferToArray(fs.readFileSync(fullUri));
			} else {
				return fs.readFileSync(fullUri, "utf8");
			}
		}
	};
}

describe("resolve-includes", () => {
	test("is a function", () => {
		expect(typeof resolveIncludes).toBe("function");
	});

	test("deep test resolves all", () => {
		const pathSrc = path.join(__dirname, "/resolve-includes/entry.asm");

		// Read
		const src = fs.readFileSync(pathSrc, { encoding: "utf8" });

		// Resolve
		const includes = resolveIncludes(src, resolveIncludesFromFileSystem("resolve-includes"));

		// Count number of entry-level includes
		expect(includes.length).toBe(3);

		// Count number of included files
		const includeCounter = (acc, include) => include.includes.reduce(includeCounter, acc + 1);
		expect(includes.reduce(includeCounter, 0)).toBe(6);

		expect(includes).toMatchSnapshot();
	});

	test("assembles with resolvedIncludes only", () => {
		const pathSrc = path.join(__dirname, "/resolve-includes/entry.asm");

		// Read
		const src = fs.readFileSync(pathSrc, { encoding: "utf8" });

		// Resolve
		const includes = resolveIncludes(src, resolveIncludesFromFileSystem("resolve-includes"));

		// Compile
		const result = dasm(src, { format: 3, includes: includes });
		expect(result.output).toMatchSnapshot();

		// Check ROM
		const myOut = result.data;
		expect(myOut.length).toEqual(4096);
	});

	test("resolves simple code includes (clock)", () => {
		const pathSrc = path.join(__dirname, "/roms/clock.asm");

		const src = fs.readFileSync(pathSrc, { encoding: "utf8" });
		const includes = resolveIncludes(src, resolveIncludesFromFileSystem("roms"));

		expect(includes.length).toEqual(0);
		expect(includes).toMatchSnapshot();
	});

	test("resolves complex code includes (combat) with missing vcs.h", () => {
		const pathSrc = path.join(__dirname, "/roms/dicombat.asm");

		const src = fs.readFileSync(pathSrc, { encoding: "utf8" });
		const includes = resolveIncludes(src, resolveIncludesFromFileSystem("roms"));

		expect(includes.length).toEqual(1);
		expect(includes).toMatchSnapshot();
	});

	test("resolves complex code includes (combat) with outside vcs.h", () => {
		const pathSrc = path.join(__dirname, "/roms/dicombat_2.asm");

		const src = fs.readFileSync(pathSrc, { encoding: "utf8" });
		const includes = resolveIncludes(src, resolveIncludesFromFileSystem("roms"));

		expect(includes.length).toEqual(1);
		expect(includes).toMatchSnapshot();

		const pathVcsh = path.join(__dirname, "roms", includes[0].parentRelativeUri);
		const vcsh = fs.readFileSync(pathVcsh, { encoding: "utf8" });
		const includesV = resolveIncludes(vcsh, resolveIncludesFromFileSystem("roms"));

		expect(includesV.length).toEqual(0);
		expect(includesV).toMatchSnapshot();
	});
});
