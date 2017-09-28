package myhome.common.util;

public class Pagemaker {
	private final int PER = 20;
	private final double DPER = 20.0;
	private int page;
	private int count;
	private int start;
	private int end;
	private boolean prev;
	private boolean next;
	private int from;
	private int to;
	private int totalPage;

	public int getTotalPage() {
		return totalPage;
	}

	public void setTotalPage(int totalPage) {
		this.totalPage = totalPage;
	}

	public int getFrom() {
		return from;
	}

	public void setFrom(int from) {
		this.from = from;
	}

	public int getTo() {
		return to;
	}

	public void setTo(int to) {
		this.to = to;
	}

	public int getPER() {
		return PER;
	}
	
	public int getCount() {
		return count;
	}

	public int getStart() {
		return start;
	}

	public void setStart(int start) {
		this.start = start;
	}

	public int getEnd() {
		return end;
	}

	public void setEnd(int end) {
		this.end = end;
	}

	public boolean isPrev() {
		return prev;
	}

	public void setPrev(boolean prev) {
		this.prev = prev;
	}

	public boolean isNext() {
		return next;
	}

	public void setNext(boolean next) {
		this.next = next;
	}

	public int getPage() {
		return page;
	}

	public void setPage(int page) {
		if (page < 1) {
			this.page = 1;
			return;
		}
		this.page = page;
	}

	public void setCount(int count) {
		if (count < 1) {
			return;
		}
		this.count = count;
		System.out.println("총 컬럼 갯수 = " + count);
		calcPage();
	}

	private void calcPage() { 
		// page변수는 현재 페이지번호 
		int tempEnd = (int)(Math.ceil(page / DPER) * PER);
		this.totalPage = this.count / PER;
		int remaind = this.count % PER;
		if(remaind>0) {
			this.totalPage++;
		}
		// 현재 페이지번호를 기준으로 끝 페이지를 계산한다.
		System.out.println("page = " +page);
		System.out.println("tempEnd = "+tempEnd);
		System.out.println("this.count =" +this.count);
		System.out.println("totalPage =" + this.totalPage);
		
		// 시작 페이지 계산
		this.start = tempEnd - (PER - 1);
		if (tempEnd * PER > this.count) { // 가상으로 계산한 tempEnd크기가 실제 count보다 많을경우
			this.end = (int) Math.ceil(this.count / DPER);
		} else { 
			this.end = tempEnd; // 실제 count가 tempEnd보다 많을경우 
		}
		System.out.println("this.end = "+this.end);
		this.prev = this.page != 1;
		this.next = this.page != this.totalPage;
		
		this.from = ((page -1) * 20) + 1;
		this.to = page * 20;
		if(this.to > this.count) {
			this.to= this.count;
		}
	}
}
