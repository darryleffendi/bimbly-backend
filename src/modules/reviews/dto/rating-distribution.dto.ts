export class RatingDistributionDto {
  star: number;
  count: number;

  constructor(star: number, count: number) {
    this.star = star;
    this.count = count;
  }
}
