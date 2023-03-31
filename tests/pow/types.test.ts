import { Puzzle, Question, rng, randomInRange, sha256 } from "../../src";

describe("types in pow", () => {
  const mockDifficulty = rng(2);
  const mockSalt = rng();
  const mockHash = sha256(mockSalt.toString(16));

  const mockQuestionObject = {
    difficulty: mockDifficulty.toString(16),
    salt: mockSalt.toString(16),
    hash: mockHash,
  };

  const mockSolution = randomInRange(0, mockDifficulty);
  const mockQuestion = new Question(mockDifficulty, mockSalt, mockHash);

  const mockPuzzle = new Puzzle(mockQuestion, mockSolution);

  describe("Question", () => {
    it("should be able to create a question from an object", () => {
      expect(Question.fromObject(mockQuestionObject)).toEqual(mockQuestion);
    });

    it("should be able to convert a question to an object", () => {
      expect(mockQuestion.toObject()).toEqual(mockQuestionObject);
    });

    it("should be able to convert a question to a string", () => {
      expect(mockQuestion.toString()).toEqual(
        mockDifficulty.toString(16) + mockSalt.toString(16) + mockHash
      );
    });
  });

  describe("Puzzle", () => {
    it("should be able to create a puzzle from a question and a solution", () => {
      expect(mockPuzzle.question).toEqual(mockQuestion);
      expect(mockPuzzle.solution).toEqual(mockSolution);
    });

    it("should be able to convert a puzzle to an object", () => {
      expect(mockPuzzle.toObject()).toEqual({
        solution: mockSolution.toString(16),
        difficulty: mockDifficulty.toString(16),
        salt: mockSalt.toString(16),
        hash: mockHash,
      });
    });

    it("should be able to convert a puzzle to a string", () => {
      expect(mockPuzzle.toString()).toEqual(
        mockDifficulty.toString(16) + mockSalt.toString(16) + mockHash + mockSolution.toString(16)
      );
    });

    it("should be able to generate a key using sha256", () => {
      expect(mockPuzzle.key()).toEqual(sha256(mockPuzzle.toString()));
    });
  });
});
